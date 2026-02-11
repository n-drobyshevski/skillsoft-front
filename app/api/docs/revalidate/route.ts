import { NextRequest, NextResponse } from 'next/server';
import { revalidateDocsTags } from '@/app/actions';

/**
 * Documentation Revalidation Webhook Endpoint
 * Эндпоинт вебхука для ревалидации документации
 *
 * POST /api/docs/revalidate
 *
 * This endpoint allows external services (CMS, CI/CD, etc.) to trigger
 * cache invalidation for documentation pages.
 * Этот эндпоинт позволяет внешним сервисам (CMS, CI/CD и т.д.) запускать
 * инвалидацию кеша страниц документации.
 *
 * @security Requires REVALIDATE_SECRET token for authentication
 *           Требуется токен REVALIDATE_SECRET для аутентификации
 *
 * @body {
 *   slug?: string;  // Optional: specific doc page to revalidate / Опционально: конкретная страница для ревалидации
 *   secret: string; // Required: authentication secret / Обязательно: секрет аутентификации
 * }
 *
 * @returns {
 *   revalidated: boolean;
 *   slug?: string;
 *   timestamp: string;
 * }
 *
 * @example
 * // Revalidate all docs / Ревалидировать всю документацию
 * curl -X POST https://your-domain.com/api/docs/revalidate \
 *   -H "Content-Type: application/json" \
 *   -d '{"secret": "your-secret"}'
 *
 * // Revalidate specific page / Ревалидировать конкретную страницу
 * curl -X POST https://your-domain.com/api/docs/revalidate \
 *   -H "Content-Type: application/json" \
 *   -d '{"secret": "your-secret", "slug": "getting-started"}'
 */

interface RevalidateRequestBody {
  slug?: string;
  secret: string;
}

interface RevalidateSuccessResponse {
  revalidated: true;
  slug: string | null;
  timestamp: string;
  message: string;
}

interface RevalidateErrorResponse {
  error: string;
  details?: string;
}

/**
 * POST handler for documentation revalidation
 * Обработчик POST-запросов для ревалидации документации
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<RevalidateSuccessResponse | RevalidateErrorResponse>> {
  try {
    // Parse request body
    // Парсим тело запроса
    const body = (await request.json()) as RevalidateRequestBody;
    const { slug, secret } = body;

    // Validate secret token
    // Проверяем секретный токен
    const expectedSecret = process.env.REVALIDATE_SECRET;

    if (!expectedSecret) {
      console.error('[docs/revalidate] REVALIDATE_SECRET environment variable is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid or missing secret token' },
        { status: 401 }
      );
    }

    // Validate slug format if provided (prevent path traversal)
    // Проверяем формат slug, если указан (предотвращаем обход пути)
    if (slug && (slug.includes('..') || slug.includes('/') || slug.includes('\\'))) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // Call the revalidation server action
    // Вызываем серверное действие для ревалидации
    const result = await revalidateDocsTags(slug);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Revalidation failed', details: result.message },
        { status: 500 }
      );
    }

    // Return success response
    // Возвращаем успешный ответ
    const response: RevalidateSuccessResponse = {
      revalidated: true,
      slug: slug || null,
      timestamp: new Date().toISOString(),
      message: result.message,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle JSON parsing errors and other exceptions
    // Обрабатываем ошибки парсинга JSON и другие исключения
    console.error('[docs/revalidate] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isSyntaxError = error instanceof SyntaxError;

    return NextResponse.json(
      {
        error: isSyntaxError ? 'Invalid JSON in request body' : 'Revalidation failed',
        details: errorMessage,
      },
      { status: isSyntaxError ? 400 : 500 }
    );
  }
}

/**
 * GET handler - returns endpoint status info (for debugging/monitoring)
 * GET обработчик - возвращает информацию о статусе эндпоинта (для отладки/мониторинга)
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/docs/revalidate',
    method: 'POST',
    secretConfigured: !!process.env.REVALIDATE_SECRET,
    description: 'Documentation cache revalidation webhook',
    usage: {
      body: {
        secret: 'string (required) - Authentication secret',
        slug: 'string (optional) - Specific documentation page slug to revalidate',
      },
    },
  });
}
