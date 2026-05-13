import { auth } from '@/lib/firebase';

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export class ClientApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new ClientApiError(401, 'You must be signed in to complete this action.');
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  let response: Response;

  try {
    response = await fetch(path, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ClientApiError(408, 'The server took too long to respond. Please try again.');
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;

  if (!response.ok) {
    throw new ClientApiError(response.status, payload?.error || 'Request failed.');
  }

  return payload as T;
}
