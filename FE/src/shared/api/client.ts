export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code = 'API_ERROR',
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

const API_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN as string | undefined) ||
  'http://localhost:8000';

function getXsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='));
  return match ? decodeURIComponent(match.split('=')[1] ?? '') : null;
}

export async function ensureCsrfCookie(): Promise<void> {
  await fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const xsrf = getXsrfToken();
  if (xsrf) {
    headers.set('X-XSRF-TOKEN', xsrf);
  }

  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const err =
      isJson && typeof payload === 'object' && payload !== null
        ? (payload as {
            message?: string;
            code?: string;
            errors?: Record<string, string[]>;
          })
        : {};
    throw new ApiError(
      err.message ?? `Request failed (${response.status})`,
      response.status,
      err.code ?? 'HTTP_ERROR',
      err.errors,
    );
  }

  return payload as T;
}

export function getApiOrigin(): string {
  return API_ORIGIN;
}
