import type { LoginInput, RegisterInput } from './schemas';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type AuthUser = { id: string; email: string; username: string; avatarUrl: string | null };

async function parse(res: Response): Promise<{ user: AuthUser }> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? 'Ошибка запроса');
  return data;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return (await parse(res)).user;
}

export async function register(input: RegisterInput, avatar: File | null): Promise<AuthUser> {
  const form = new FormData();
  form.set('email', input.email);
  form.set('username', input.username);
  form.set('password', input.password);
  if (avatar) form.set('avatar', avatar);
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  return (await parse(res)).user;
}

export async function logout(): Promise<void> {
  await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
}

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
  if (res.status === 401) return null;
  return (await parse(res)).user;
}
