import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { prisma } from '../db';
import { hashPassword, verifyPassword } from '../lib/password';
import { uploadAvatar, getAvatarUrl } from '../lib/storage';
import { SESSION_COOKIE, sessionCookieOptions } from '../lib/session';
import { registerBody, loginBody } from '../schemas/auth';

type PublicUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
};

function toPublicUser(u: {
  id: string;
  email: string;
  username: string;
  avatarKey: string | null;
  createdAt: Date;
}): PublicUser {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    avatarUrl: getAvatarUrl(u.avatarKey),
    createdAt: u.createdAt.toISOString(),
  };
}

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET ?? 'dev-secret', exp: '7d' }))
  .post(
    '/register',
    async ({ body, jwt, cookie, set }) => {
      const exists = await prisma.user.findFirst({
        where: { OR: [{ email: body.email }, { username: body.username }] },
      });
      if (exists) {
        set.status = 409;
        return { error: 'Email или username уже заняты' };
      }

      let avatarKey: string | null = null;
      if (body.avatar) {
        try {
          avatarKey = await uploadAvatar(body.avatar);
        } catch (e) {
          set.status = 400;
          return { error: e instanceof Error ? e.message : 'Ошибка загрузки файла' };
        }
      }

      const user = await prisma.user.create({
        data: {
          email: body.email,
          username: body.username,
          passwordHash: await hashPassword(body.password),
          avatarKey,
        },
      });

      const token = await jwt.sign({ sub: user.id, email: user.email });
      cookie[SESSION_COOKIE].set({ value: token, ...sessionCookieOptions });
      return { user: toPublicUser(user) };
    },
    { body: registerBody },
  )
  .post(
    '/login',
    async ({ body, jwt, cookie, set }) => {
      const user = await prisma.user.findUnique({ where: { email: body.email } });
      if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
        set.status = 401;
        return { error: 'Неверный email или пароль' };
      }
      const token = await jwt.sign({ sub: user.id, email: user.email });
      cookie[SESSION_COOKIE].set({ value: token, ...sessionCookieOptions });
      return { user: toPublicUser(user) };
    },
    { body: loginBody },
  )
  .post('/logout', ({ cookie }) => {
    cookie[SESSION_COOKIE].remove();
    return { ok: true };
  })
  .get('/me', async ({ jwt, cookie, set }) => {
    const token = cookie[SESSION_COOKIE].value as string | undefined;
    const payload = token ? await jwt.verify(token) : false;
    const sub = payload && typeof payload.sub === 'string' ? payload.sub : null;
    if (!sub) {
      set.status = 401;
      return { error: 'Не авторизован' };
    }
    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user) {
      set.status = 401;
      return { error: 'Не авторизован' };
    }
    return { user: toPublicUser(user) };
  });
