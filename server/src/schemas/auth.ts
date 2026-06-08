import { t } from 'elysia';

export const registerBody = t.Object({
  email: t.String({ format: 'email' }),
  username: t.String({ minLength: 3, maxLength: 32 }),
  password: t.String({ minLength: 8 }),
  avatar: t.Optional(t.File({ type: 'image', maxSize: '2m' })),
});

export const loginBody = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 1 }),
});
