// 백엔드 공통 응답 envelope: { success, data, message, error }
// vite.config의 proxy로 /api → http://localhost:8000 (백엔드 FastAPI)

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

function buildUrl(path: string, query?: RequestOptions['query']): string {
  let url = path.startsWith('/') ? path : `/${path}`;
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
  const url = buildUrl(path, query);

  const init: RequestInit = { method, signal };

  if (formData) {
    init.body = formData;
    // multipart는 브라우저가 boundary 자동 설정 — Content-Type 직접 안 둠
  } else if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : '네트워크 오류';
    throw new ApiError(`서버에 연결할 수 없어요: ${message}`, 'NETWORK_ERROR', 0);
  }

  // 본문이 비어있을 수도 있음 (DELETE 등)
  const text = await response.text();
  let payload: ApiEnvelope<T> | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
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
