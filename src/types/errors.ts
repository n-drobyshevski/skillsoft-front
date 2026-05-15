/**
 * Error types for the Skillsoft application.
 * Provides comprehensive error handling types that match backend ErrorResponse structure.
 */

// ERROR CATEGORIES

/**
 * Error categories for classifying API errors.
 * Helps determine appropriate UI feedback and recovery actions.
 */
export enum ErrorCategory {
  /** Network-level errors (connection failed, timeout) */
  NETWORK = 'NETWORK',
  /** Authentication errors (401 - not logged in) */
  AUTHENTICATION = 'AUTHENTICATION',
  /** Authorization errors (403 - no permission) */
  AUTHORIZATION = 'AUTHORIZATION',
  /** Resource not found (404) */
  NOT_FOUND = 'NOT_FOUND',
  /** Validation errors (400 - bad input) */
  VALIDATION = 'VALIDATION',
  /** Conflict errors (409 - duplicate, constraint violation) */
  CONFLICT = 'CONFLICT',
  /** Rate limiting (429) */
  RATE_LIMIT = 'RATE_LIMIT',
  /** Server errors (5xx - database, internal) */
  SERVER = 'SERVER',
  /** Unknown/unclassified errors */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Specific error codes returned by the backend.
 * Used for programmatic error handling.
 */
export enum ErrorCode {
  // Authentication/Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',

  // Conflict errors
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  DUPLICATE_SESSION = 'DUPLICATE_SESSION',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  OPTIMISTIC_LOCK_FAILURE = 'OPTIMISTIC_LOCK_FAILURE',

  // Test session errors
  TEST_NOT_READY = 'TEST_NOT_READY',

  // Template state errors
  TEMPLATE_NOT_EDITABLE = 'TEMPLATE_NOT_EDITABLE',

  // Server errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CORS_ERROR = 'CORS_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
}

// ERROR INTERFACES

/**
 * Validation error detail for form fields.
 * Matches backend ValidationError structure.
 */
export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

/**
 * Backend error response structure.
 * Matches the ErrorResponse DTO from Spring Boot.
 */
export interface BackendErrorResponse {
  status: number;
  message: string;
  code?: string;
  details?: string;
  timestamp?: string;
  path?: string;
  correlationId?: string;
  validationErrors?: ValidationError[];
  exceptionName?: string;
  context?: Record<string, unknown>;
}

/**
 * Enhanced API error with rich metadata.
 * Extends Error with additional properties for comprehensive error handling.
 */
export interface ApiError extends Error {
  /** HTTP status code */
  status?: number;
  /** Error code from backend */
  code?: ErrorCode | string;
  /** Error category for UI handling */
  category: ErrorCategory;
  /** Detailed error message for users */
  details?: string;
  /** Correlation ID for support/debugging */
  correlationId?: string;
  /** Validation errors for form fields */
  validationErrors?: ValidationError[];
  /** Additional context data */
  context?: Record<string, unknown>;
  /** Original error response from backend */
  originalResponse?: BackendErrorResponse;
  /** Whether the error is recoverable (can retry) */
  isRetryable: boolean;
  /** Suggested action for the user */
  suggestedAction?: ErrorAction;
}

/**
 * Suggested actions for error recovery.
 */
export enum ErrorAction {
  /** User should retry the operation */
  RETRY = 'RETRY',
  /** User should sign in again */
  SIGN_IN = 'SIGN_IN',
  /** User should go back to previous page */
  GO_BACK = 'GO_BACK',
  /** User should contact support */
  CONTACT_SUPPORT = 'CONTACT_SUPPORT',
  /** User should refresh the page */
  REFRESH = 'REFRESH',
  /** No action available */
  NONE = 'NONE',
}

// ERROR FACTORY FUNCTIONS

/**
 * Determines error category from HTTP status code.
 */
export function getErrorCategory(status: number): ErrorCategory {
  if (status === 401) return ErrorCategory.AUTHENTICATION;
  if (status === 403) return ErrorCategory.AUTHORIZATION;
  if (status === 404) return ErrorCategory.NOT_FOUND;
  if (status === 400 || status === 422) return ErrorCategory.VALIDATION;
  if (status === 409) return ErrorCategory.CONFLICT;
  if (status === 429) return ErrorCategory.RATE_LIMIT;
  if (status >= 500) return ErrorCategory.SERVER;
  return ErrorCategory.UNKNOWN;
}

/**
 * Determines if an error is retryable based on its category.
 */
export function isRetryableError(category: ErrorCategory): boolean {
  return [
    ErrorCategory.NETWORK,
    ErrorCategory.SERVER,
    ErrorCategory.RATE_LIMIT,
  ].includes(category);
}

/**
 * Gets suggested action based on error category.
 */
export function getSuggestedAction(category: ErrorCategory): ErrorAction {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return ErrorAction.SIGN_IN;
    case ErrorCategory.AUTHORIZATION:
      return ErrorAction.GO_BACK;
    case ErrorCategory.NOT_FOUND:
      return ErrorAction.GO_BACK;
    case ErrorCategory.VALIDATION:
      return ErrorAction.NONE;
    case ErrorCategory.NETWORK:
    case ErrorCategory.SERVER:
    case ErrorCategory.RATE_LIMIT:
      return ErrorAction.RETRY;
    case ErrorCategory.CONFLICT:
      return ErrorAction.REFRESH;
    default:
      return ErrorAction.CONTACT_SUPPORT;
  }
}

/**
 * Creates an ApiError from a backend response or network error.
 */
export function createApiError(
  message: string,
  status: number = 0,
  backendResponse?: BackendErrorResponse
): ApiError {
  const category = status === 0 ? ErrorCategory.NETWORK : getErrorCategory(status);

  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  error.status = status;
  error.category = category;
  error.isRetryable = isRetryableError(category);
  error.suggestedAction = getSuggestedAction(category);

  if (backendResponse) {
    error.code = backendResponse.code;
    error.details = backendResponse.details;
    error.correlationId = backendResponse.correlationId;
    error.validationErrors = backendResponse.validationErrors;
    error.context = backendResponse.context;
    error.originalResponse = backendResponse;
  }

  return error;
}

/**
 * Creates a network error.
 */
export function createNetworkError(originalError?: Error): ApiError {
  const error = createApiError(
    'Unable to connect to server. Please check your internet connection.',
    0
  );
  error.code = ErrorCode.NETWORK_ERROR;
  if (originalError?.message?.includes('CORS')) {
    error.code = ErrorCode.CORS_ERROR;
    error.message = 'Connection blocked by CORS policy. Please contact support.';
  } else if (originalError?.message?.includes('ECONNREFUSED')) {
    error.code = ErrorCode.CONNECTION_REFUSED;
    error.message = 'Server is not available. Please try again later.';
  } else if (originalError?.message?.includes('timeout')) {
    error.code = ErrorCode.TIMEOUT;
    error.message = 'Request timed out. Please try again.';
  }
  return error;
}

// USER-FACING ERROR MESSAGES

/**
 * Gets a user-friendly error message based on category.
 * Messages are in Russian as per application locale.
 */
export function getUserFriendlyMessage(category: ErrorCategory, details?: string): string {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return 'Требуется авторизация. Пожалуйста, войдите в систему.';
    case ErrorCategory.AUTHORIZATION:
      return 'У вас нет прав для выполнения этого действия.';
    case ErrorCategory.NOT_FOUND:
      return 'Запрашиваемый ресурс не найден.';
    case ErrorCategory.VALIDATION:
      return details || 'Пожалуйста, проверьте введённые данные.';
    case ErrorCategory.CONFLICT:
      return details || 'Конфликт данных. Обновите страницу и попробуйте снова.';
    case ErrorCategory.RATE_LIMIT:
      return 'Слишком много запросов. Подождите немного и попробуйте снова.';
    case ErrorCategory.NETWORK:
      return 'Не удалось подключиться к серверу. Проверьте интернет-соединение.';
    case ErrorCategory.SERVER:
      return 'Произошла ошибка на сервере. Пожалуйста, попробуйте позже.';
    default:
      return details || 'Произошла непредвиденная ошибка.';
  }
}

/**
 * Gets a title for error display based on category.
 * Messages are in Russian as per application locale.
 */
export function getErrorTitle(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return 'Требуется вход';
    case ErrorCategory.AUTHORIZATION:
      return 'Доступ запрещён';
    case ErrorCategory.NOT_FOUND:
      return 'Не найдено';
    case ErrorCategory.VALIDATION:
      return 'Ошибка валидации';
    case ErrorCategory.CONFLICT:
      return 'Конфликт данных';
    case ErrorCategory.RATE_LIMIT:
      return 'Превышен лимит запросов';
    case ErrorCategory.NETWORK:
      return 'Ошибка сети';
    case ErrorCategory.SERVER:
      return 'Ошибка сервера';
    default:
      return 'Произошла ошибка';
  }
}

// ERROR CODE → USER-FRIENDLY MESSAGES (RU)

/**
 * Maps known backend error codes to user-friendly Russian messages.
 * Returns undefined for unmapped codes (falls back to category message).
 */
const ERROR_CODE_MESSAGES: Partial<Record<string, string>> = {
  [ErrorCode.TEMPLATE_NOT_EDITABLE]:
    'Этот шаблон опубликован и не может быть изменён. Создайте новую версию для внесения правок.',
  [ErrorCode.DUPLICATE_SESSION]:
    'У вас уже есть незавершённая сессия для этого шаблона.',
  [ErrorCode.TEST_NOT_READY]:
    'Тест не готов к запуску: недостаточно вопросов для одной или нескольких компетенций.',
  CONCURRENT_MODIFICATION:
    'Ресурс был изменён другим запросом. Обновите страницу и попробуйте снова.',
};

/**
 * Returns a user-friendly Russian message for a known error code,
 * or undefined if no specific mapping exists.
 */
export function getErrorCodeMessage(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return ERROR_CODE_MESSAGES[code];
}

// TYPE GUARDS

/**
 * Type guard to check if an error is an ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    'category' in error &&
    'isRetryable' in error
  );
}

/**
 * Type guard to check if a response is a backend error response.
 */
export function isBackendErrorResponse(data: unknown): data is BackendErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    'message' in data
  );
}
