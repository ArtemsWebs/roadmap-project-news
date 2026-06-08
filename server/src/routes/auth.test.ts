import { afterAll, beforeEach, describe, expect, it } from 'bun:test';
import { app } from '../index';
import { prisma } from '../db';

const base = 'http://localhost';

function jsonReq(path: string, body: unknown, cookie?: string) {
  return new Request(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
});

describe('auth routes', () => {
  it('register создаёт пользователя и ставит cookie', async () => {
    const res = await app.handle(
      jsonReq('/auth/register', { email: 'a@a.com', username: 'neo', password: 'password123' }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.email).toBe('a@a.com');
    expect(data.user.username).toBe('neo');
    expect(typeof data.user.createdAt).toBe('string');
    expect(Number.isNaN(Date.parse(data.user.createdAt))).toBe(false);
    expect(res.headers.get('set-cookie')).toContain('session=');
  });

  it('повторный email/username даёт 409', async () => {
    await app.handle(jsonReq('/auth/register', { email: 'a@a.com', username: 'neo', password: 'password123' }));
    const res = await app.handle(
      jsonReq('/auth/register', { email: 'a@a.com', username: 'neo', password: 'password123' }),
    );
    expect(res.status).toBe(409);
  });

  it('login с верным паролем — 200 + cookie', async () => {
    await app.handle(jsonReq('/auth/register', { email: 'a@a.com', username: 'neo', password: 'password123' }));
    const res = await app.handle(jsonReq('/auth/login', { email: 'a@a.com', password: 'password123' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('session=');
  });

  it('login с неверным паролем — 401', async () => {
    await app.handle(jsonReq('/auth/register', { email: 'a@a.com', username: 'neo', password: 'password123' }));
    const res = await app.handle(jsonReq('/auth/login', { email: 'a@a.com', password: 'wrongpass' }));
    expect(res.status).toBe(401);
  });

  it('me без cookie — 401', async () => {
    const res = await app.handle(new Request(base + '/auth/me'));
    expect(res.status).toBe(401);
  });

  it('me с валидной cookie — возвращает пользователя', async () => {
    const reg = await app.handle(
      jsonReq('/auth/register', { email: 'a@a.com', username: 'neo', password: 'password123' }),
    );
    const setCookie = reg.headers.get('set-cookie')!;
    const cookie = setCookie.split(';')[0]; // session=<token>
    const res = await app.handle(new Request(base + '/auth/me', { headers: { cookie } }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.email).toBe('a@a.com');
  });
});
