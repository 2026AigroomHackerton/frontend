const DEPLOYED_BACKEND_URL = 'https://backend-ih3q.onrender.com';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: string;
  error: string | null;
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

function getDefaultApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hostname.endsWith('.onrender.com') ? DEPLOYED_BACKEND_URL : '';
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl()).replace(
  /\/+$/,
  '',
);

export function buildApiUrl(path: string, query?: RequestOptions['query']): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${API_BASE_URL}${normalizedPath}`;

  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      params.append(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  return url;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, formData, query, signal } = options;
  const url = buildApiUrl(path, query);
  const init: RequestInit = { method, signal };

  if (formData) {
    init.body = formData;
  } else if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'network error';
    throw new ApiError(`서버에 연결할 수 없습니다. ${message}`, 'NETWORK_ERROR', 0);
  }

  const text = await response.text();
  let payload: ApiEnvelope<T> | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      console.error('Invalid API response', {
        url,
        status: response.status,
        contentType: response.headers.get('content-type'),
        preview: text.slice(0, 200),
      });
      throw new ApiError(
        `응답 형식이 올바르지 않습니다 (HTTP ${response.status})`,
        'INVALID_RESPONSE',
        response.status,
      );
    }
  }

  if (!response.ok || !payload || payload.success === false) {
    const code = payload?.error ?? 'UNKNOWN_ERROR';
    const message = payload?.message ?? `요청 실패 (HTTP ${response.status})`;
    throw new ApiError(message, code, response.status);
  }

  return payload.data as T;
}
