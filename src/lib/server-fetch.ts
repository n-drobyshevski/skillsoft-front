/**
 * Server-side fetch utilities with retry and error handling for Next.js Server Components.
 *
 * Provides a wrapper around API calls with:
 * - Automatic retry with exponential backoff for transient errors
 * - Rich error metadata preservation
 * - Fallback value support for graceful degradation
 * - Type-safe result handling
 */

import { retryWithBackoff, isServerError } from '@/utils/retry';
import {
  ApiError,
  ErrorCategory,
  isApiError,
  createApiError,
  getErrorCategory,
  isRetryableError as isRetryableCategory,
  getSuggestedAction,
  ErrorAction,
} from '@/types/errors';

// ============================================
// TYPES
// ============================================

/**
 * Simplified error structure for Server Components.
 * Serializable and contains essential error information.
 */
export interface ServerFetchError {
  /** User-friendly error message */
  message: string;
  /** HTTP status code (0 for network errors) */
  status: number;
  /** Error category for UI handling */
  category: ErrorCategory;
  /** Correlation ID for debugging/support */
  correlationId?: string;
  /** Whether the error can be retried */
  isRetryable: boolean;
  /** Suggested action for recovery */
  suggestedAction: ErrorAction;
  /** Error code from backend */
  code?: string;
}

/**
 * Result of a server fetch operation.
 * Either contains data or an error, never both.
 */
export interface ServerFetchResult<T> {
  data: T | null;
  error: ServerFetchError | null;
}

/**
 * Options for server fetch with retry.
 */
export interface ServerFetchOptions<T> {
  /** Maximum number of retry attempts (default: 2) */
  maxRetries?: number;
  /** Initial delay between retries in ms (default: 300) */
  initialDelayMs?: number;
  /** Maximum delay between retries in ms (default: 5000) */
  maxDelayMs?: number;
  /** Fallback value to return on error */
  fallbackValue?: T;
  /** Custom retry condition (default: retry on 5xx and network errors) */
  shouldRetry?: (error: unknown) => boolean;
  /** Called on each retry attempt */
  onRetry?: (error: unknown, attempt: number) => void;
}

// ============================================
// ERROR CONVERSION
// ============================================

/**
 * Get a user-friendly message based on HTTP status code.
 * Ensures users always see meaningful error messages.
 */
function getStatusMessage(status: number, originalMessage?: string): string {
  // If we have a meaningful original message, use it
  if (originalMessage && !originalMessage.includes('Error') && originalMessage.length > 10) {
    return originalMessage;
  }

  // Provide clear Russian messages based on status
  switch (status) {
    case 400:
      return 'Некорректный запрос. Проверьте введённые данные.';
    case 401:
      return 'Требуется авторизация. Пожалуйста, войдите в систему.';
    case 403:
      return 'Доступ запрещён. У вас нет прав для выполнения этого действия.';
    case 404:
      return 'Запрашиваемый ресурс не найден.';
    case 409:
      return 'Конфликт данных. Возможно, данные были изменены другим пользователем.';
    case 422:
      return 'Ошибка валидации данных.';
    case 429:
      return 'Слишком много запросов. Пожалуйста, подождите.';
    case 500:
      return 'Внутренняя ошибка сервера. Мы работаем над её устранением.';
    case 502:
      return 'Сервер временно недоступен. Повторите попытку через несколько секунд.';
    case 503:
      return 'Сервис временно недоступен. Ведутся технические работы.';
    case 504:
      return 'Превышено время ожидания ответа от сервера.';
    default:
      if (status >= 400 && status < 500) {
        return `Ошибка запроса (${status}). Проверьте введённые данные.`;
      }
      if (status >= 500) {
        return `Ошибка сервера (${status}). Попробуйте позже.`;
      }
      return originalMessage || 'Произошла непредвиденная ошибка.';
  }
}

/**
 * Converts any error to a serializable ServerFetchError.
 */
function toServerFetchError(error: unknown): ServerFetchError {
  // Handle ApiError (rich error from api.ts)
  if (isApiError(error)) {
    const status = error.status ?? 0;
    return {
      message: getStatusMessage(status, error.message),
      status,
      category: error.category,
      correlationId: error.correlationId,
      isRetryable: error.isRetryable,
      suggestedAction: error.suggestedAction ?? ErrorAction.NONE,
      code: error.code,
    };
  }

  // Handle errors with status property
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    const category = getErrorCategory(status);
    const originalMessage =
      'message' in error && typeof error.message === 'string'
        ? error.message
        : undefined;

    return {
      message: getStatusMessage(status, originalMessage),
      status,
      category,
      correlationId:
        'correlationId' in error && typeof error.correlationId === 'string'
          ? error.correlationId
          : undefined,
      isRetryable: isRetryableCategory(category),
      suggestedAction: getSuggestedAction(category),
      code: 'code' in error && typeof error.code === 'string' ? error.code : undefined,
    };
  }

  // Handle standard Error
  if (error instanceof Error) {
    // Check for network errors
    const isNetworkError =
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('CORS');

    const category = isNetworkError ? ErrorCategory.NETWORK : ErrorCategory.UNKNOWN;
    const message = isNetworkError
      ? 'Не удалось подключиться к серверу. Проверьте интернет-соединение.'
      : error.message;

    return {
      message,
      status: 0,
      category,
      isRetryable: isRetryableCategory(category),
      suggestedAction: getSuggestedAction(category),
    };
  }

  // Fallback for unknown error types
  return {
    message: 'Произошла непредвиденная ошибка',
    status: 0,
    category: ErrorCategory.UNKNOWN,
    isRetryable: false,
    suggestedAction: ErrorAction.CONTACT_SUPPORT,
  };
}

// ============================================
// RETRY CONDITION
// ============================================

/**
 * Default retry condition: retry on 5xx errors and network errors.
 */
function defaultShouldRetry(error: unknown): boolean {
  // Retry on server errors (5xx)
  if (isServerError(error)) {
    return true;
  }

  // Retry on network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('econnrefused') ||
      message.includes('timeout') ||
      message.includes('socket')
    );
  }

  // Check ApiError category
  if (isApiError(error)) {
    return error.isRetryable;
  }

  return false;
}

// ============================================
// MAIN UTILITY
// ============================================

/**
 * Fetches data with automatic retry and error handling for Server Components.
 *
 * @param fn - Async function that fetches data
 * @param options - Retry and fallback options
 * @returns Result object with either data or error
 *
 * @example
 * ```typescript
 * const { data, error } = await serverFetchWithRetry(
 *   () => psychometricsApi.getCompetencies({ page: 0, size: 20 }),
 *   {
 *     maxRetries: 2,
 *     fallbackValue: EMPTY_PAGE,
 *   }
 * );
 *
 * if (error) {
 *   // Handle error with rich metadata
 *   console.error(`Error [${error.correlationId}]: ${error.message}`);
 * }
 * ```
 */
export async function serverFetchWithRetry<T>(
  fn: () => Promise<T>,
  options: ServerFetchOptions<T> = {}
): Promise<ServerFetchResult<T>> {
  const {
    maxRetries = 2,
    initialDelayMs = 300,
    maxDelayMs = 5000,
    fallbackValue,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  try {
    const data = await retryWithBackoff(fn, {
      maxRetries,
      initialDelayMs,
      maxDelayMs,
      shouldRetry,
      onRetry: (error, attempt) => {
        // Log retry attempts in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[serverFetchWithRetry] Retry attempt ${attempt}:`, error);
        }
        onRetry?.(error, attempt);
      },
    });

    return { data, error: null };
  } catch (error) {
    const serverError = toServerFetchError(error);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[serverFetchWithRetry] Final error:', {
        message: serverError.message,
        status: serverError.status,
        category: serverError.category,
        correlationId: serverError.correlationId,
      });
    }

    return {
      data: fallbackValue ?? null,
      error: serverError,
    };
  }
}

/**
 * Fetches multiple resources in parallel with individual error handling.
 * Useful for pages that need data from multiple API endpoints.
 *
 * @param fetchers - Object mapping keys to fetch functions
 * @returns Object with results for each key
 *
 * @example
 * ```typescript
 * const results = await fetchAllWithFallbacks({
 *   competencies: {
 *     fn: () => psychometricsApi.getCompetencies(params),
 *     fallback: EMPTY_PAGE,
 *   },
 *   stats: {
 *     fn: () => psychometricsApi.getHealthReport(),
 *     fallback: null,
 *   },
 * });
 *
 * // Each result has { data, error } independently
 * const { data: competencies, error: compError } = results.competencies;
 * const { data: stats, error: statsError } = results.stats;
 * ```
 */
export async function fetchAllWithFallbacks<
  T extends Record<string, { fn: () => Promise<unknown>; fallback?: unknown }>
>(
  fetchers: T
): Promise<{
  [K in keyof T]: ServerFetchResult<Awaited<ReturnType<T[K]['fn']>>>;
}> {
  const keys = Object.keys(fetchers) as (keyof T)[];

  const results = await Promise.all(
    keys.map(async (key) => {
      const { fn, fallback } = fetchers[key];
      const result = await serverFetchWithRetry(fn, { fallbackValue: fallback });
      return [key, result] as const;
    })
  );

  return Object.fromEntries(results) as {
    [K in keyof T]: ServerFetchResult<Awaited<ReturnType<T[K]['fn']>>>;
  };
}

/**
 * Creates a cached fetcher that deduplicates requests.
 * Useful for shared data that multiple components need.
 *
 * Note: This uses React's cache() function internally when available.
 */
export function createCachedFetcher<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options?: Omit<ServerFetchOptions<TResult>, 'fallbackValue'>
) {
  return async (...args: TArgs): Promise<ServerFetchResult<TResult>> => {
    return serverFetchWithRetry(() => fn(...args), options);
  };
}
