export const SESSION_COOKIE = 'session';

const isProd = process.env.NODE_ENV === 'production';

/** Опции для установки сессионной cookie. */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  secure: isProd,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 дней
};

export type SessionPayload = { sub: string; email: string };
