import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { authRoutes } from './routes/auth';

export const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
      credentials: true,
    }),
  )
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      exp: '7d',
    }),
  )
  .get('/health', () => ({ ok: true }))
  .use(authRoutes);

// Запуск только когда файл исполняется напрямую (не при импорте в тестах).
if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port);
  console.log(`auth server on :${port}`);
}
