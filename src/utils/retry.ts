/**
 * Retry Utility with Exponential Backoff
 *
 * Provides robust retry mechanisms for API calls that may fail due to transient errors.
 * Implements exponential backoff to avoid overwhelming the server during retries.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

/**
 * Default retry strategy: only retry on 5xx server errors
 */
const defaultShouldRetry = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as ApiError).status;
    return status !== undefined && status >= 500 && status < 600;
  }
  return false;
};

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result
 * @throws The last error if all retries fail
 *
 * @example
 * ```typescript
 * const data = await retryWithBackoff(
 *   () => api.getCurrentQuestion(sessionId, headers),
 *   {
 *     maxRetries: 3,
 *     onRetry: (error, attempt) => {
 *       console.log(`Retry attempt ${attempt} after error:`, error);
 *     }
 *   }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If this is the last attempt or we shouldn't retry, throw the error
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs
      );

      // Notify caller of retry
      if (onRetry) {
        onRetry(error, attempt + 1);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Creates a retry wrapper for an API function
 *
 * @param fn - API function to wrap
 * @param options - Default retry options
 * @returns Wrapped function with retry logic
 *
 * @example
 * ```typescript
 * const getCurrentQuestionWithRetry = createRetryWrapper(
 *   (sessionId: string, headers: Record<string, string>) =>
 *     api.getCurrentQuestion(sessionId, headers),
 *   { maxRetries: 3 }
 * );
 *
 * const question = await getCurrentQuestionWithRetry(sessionId, headers);
 * ```
 */
export function createRetryWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  defaultOptions: RetryOptions = {}
) {
  return async (...args: TArgs): Promise<TResult> => {
    return retryWithBackoff(() => fn(...args), defaultOptions);
  };
}

/**
 * Determines if an error is retryable based on HTTP status code
 */
export function isRetryableError(error: unknown): boolean {
  return defaultShouldRetry(error);
}

/**
 * Determines if an error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as ApiError).status;
    return status !== undefined && status >= 400 && status < 500;
  }
  return false;
}

/**
 * Determines if an error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as ApiError).status;
    return status !== undefined && status >= 500 && status < 600;
  }
  return false;
}

/**
 * Gets a user-friendly error message based on error type
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'Произошла неизвестная ошибка';

  if (typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    const status = apiError.status;

    switch (status) {
      case 400:
        return 'Некорректный запрос. Проверьте введённые данные.';
      case 401:
        return 'Требуется авторизация. Пожалуйста, войдите в систему.';
      case 403:
        return 'Доступ запрещён. У вас нет прав для выполнения этого действия.';
      case 404:
        return 'Запрошенный ресурс не найден.';
      case 409:
        return 'Конфликт данных. Возможно, данные были изменены.';
      case 422:
        return 'Ошибка валидации данных.';
      case 429:
        return 'Слишком много запросов. Пожалуйста, повторите попытку позже.';
      case 500:
        return 'Внутренняя ошибка сервера. Мы работаем над её устранением.';
      case 502:
        return 'Сервер временно недоступен. Повторите попытку через несколько секунд.';
      case 503:
        return 'Сервис временно недоступен. Попробуйте позже.';
      case 504:
        return 'Превышено время ожидания ответа от сервера.';
      default:
        if (status && status >= 400 && status < 500) {
          return `Ошибка клиента (${status}). Проверьте запрос.`;
        }
        if (status && status >= 500 && status < 600) {
          return `Ошибка сервера (${status}). Попробуйте позже.`;
        }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла непредвиденная ошибка';
}
