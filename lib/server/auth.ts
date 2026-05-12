import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AppUser } from '@/lib/types';

const sessionCookie = 'medhome-session';
const oauthStateCookie = 'medhome-oauth-state';

type SessionPayload = {
  provider: AppUser['authProvider'];
  email: string;
  name: string;
  exp: number;
};

const secret = () => process.env.AUTH_SECRET || 'medhome-local-dev-secret';

const base64url = (input: Buffer | string) =>
  Buffer.from(input).toString('base64url');

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export function createSessionToken(payload: Omit<SessionPayload, 'exp'>) {
  const body = base64url(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 }));
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token?: string): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = sign(body);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
  return payload.exp > Date.now() ? payload : null;
}

export async function setSession(payload: Omit<SessionPayload, 'exp'>) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, createSessionToken(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie);
}

export async function getSession() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(sessionCookie)?.value);
}

export async function createOAuthState(provider: 'google' | 'microsoft') {
  const state = `${provider}:${randomBytes(24).toString('base64url')}`;
  const cookieStore = await cookies();
  cookieStore.set(oauthStateCookie, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  });
  return state;
}

export async function verifyOAuthState(state: string | null, provider: 'google' | 'microsoft') {
  const cookieStore = await cookies();
  const saved = cookieStore.get(oauthStateCookie)?.value;
  cookieStore.delete(oauthStateCookie);
  return Boolean(state && saved && state === saved && state.startsWith(`${provider}:`));
}

export function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  return new URL(request.url).origin;
}
