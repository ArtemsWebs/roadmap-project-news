# Cyberpunk Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить полноценную авторизацию (регистрация/вход/выход) с киберпанк-страницей `/auth` во фронт Next.js и отдельным бэкендом Elysia+Bun (Prisma+Postgres, аватары в MinIO/S3).

**Architecture:** Next.js фронт (`:3000`) общается с бэкендом Elysia на Bun (`:3001`) через fetch с `credentials:'include'`. Сессия — stateless JWT в httpOnly-cookie. Пользователи в Postgres через Prisma; аватары в MinIO через нативный `Bun.s3` (приватный бакет, presigned GET). Инфраструктура локально через docker-compose.

**Tech Stack:** Bun, Elysia (`@elysiajs/cors`, `@elysiajs/jwt`), Prisma + Postgres, `Bun.password` (argon2id), `Bun.s3`, MinIO; фронт — Next.js 16/React 19, React Query, Tailwind, zod.

**Spec:** `docs/superpowers/specs/2026-06-08-cyberpunk-auth-design.md`

---

## File Structure

**Инфраструктура (корень репо):**
- Create: `docker-compose.yml` — Postgres, MinIO, init-бакет
- Create: `server/.env.example` — образец переменных бэкенда

**Бэкенд `server/`:**
- Create: `server/package.json`, `server/tsconfig.json`
- Create: `server/prisma/schema.prisma` — модель `User`
- Create: `server/src/db.ts` — синглтон Prisma
- Create: `server/src/lib/password.ts` — hash/verify
- Create: `server/src/lib/session.ts` — имя/опции cookie
- Create: `server/src/lib/storage.ts` — Bun.s3: ключ, upload, presign
- Create: `server/src/schemas/auth.ts` — TypeBox-схемы
- Create: `server/src/routes/auth.ts` — register/login/logout/me
- Create: `server/src/index.ts` — Elysia app
- Create: `server/src/lib/password.test.ts`, `server/src/lib/storage.test.ts`, `server/src/routes/auth.test.ts`

**Фронт (`src/`):**
- Create: `src/app/auth/page.tsx`, `src/app/auth/api.ts`, `src/app/auth/schemas.ts`
- Create: `src/components/ui/CyberInput.tsx`
- Modify: `src/app/component/LogoContent.tsx` — кнопка `Subscribe`→`Auth`, навигация
- Modify: `.env.local` — `NEXT_PUBLIC_API_URL`

---

## Task 1: Инфраструктура (docker-compose + MinIO bucket)

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Создать `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: news
      POSTGRES_PASSWORD: news
      POSTGRES_DB: news
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports: ["9000:9000", "9001:9001"]
    volumes: ["miniodata:/data"]
  createbuckets:
    image: minio/mc
    depends_on: [minio]
    entrypoint: >
      /bin/sh -c "
      until mc alias set local http://minio:9000 minioadmin minioadmin; do sleep 1; done;
      mc mb -p local/avatars;
      exit 0;
      "
volumes:
  pgdata:
  miniodata:
```

- [ ] **Step 2: Поднять инфраструктуру**

Run: `docker compose up -d`
Expected: контейнеры `postgres`, `minio` запущены; `createbuckets` отработал и завершился (бакет `avatars` создан). Проверка: открыть http://localhost:9001 (minioadmin/minioadmin) → виден бакет `avatars`.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: docker-compose для Postgres и MinIO"
```

---

## Task 2: Скелет бэкенда (Bun + Elysia)

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/.env.example`
- Create: `server/.env`

- [ ] **Step 1: Инициализировать Bun-проект и поставить зависимости**

Run:
```bash
cd server
bun init -y
bun add elysia @elysiajs/cors @elysiajs/jwt @prisma/client
bun add -d prisma @types/bun
```

- [ ] **Step 2: Заменить `server/package.json` скриптами**

```json
{
  "name": "news-auth-server",
  "module": "src/index.ts",
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "test": "bun test",
    "prisma:migrate": "bunx prisma migrate dev",
    "prisma:generate": "bunx prisma generate"
  },
  "dependencies": {
    "@elysiajs/cors": "latest",
    "@elysiajs/jwt": "latest",
    "@prisma/client": "latest",
    "elysia": "latest"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "prisma": "latest"
  }
}
```

- [ ] **Step 3: Создать `server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["bun-types"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

- [ ] **Step 4: Создать `server/.env.example`**

```env
DATABASE_URL=postgresql://news:news@localhost:5432/news
JWT_SECRET=change-me-to-a-long-random-string
FRONTEND_ORIGIN=http://localhost:3000
PORT=3001
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=avatars
```

- [ ] **Step 5: Создать `server/.env` (копия с реальным секретом)**

Run: `cp server/.env.example server/.env` и заменить `JWT_SECRET` на длинную случайную строку (`openssl rand -hex 32`).

- [ ] **Step 6: Commit**

```bash
git add server/package.json server/tsconfig.json server/.env.example server/bun.lockb
git commit -m "chore: скелет бэкенда на Bun+Elysia"
```

> Примечание: `server/.env` не коммитим (должен попасть в `.gitignore`). Если в корневом `.gitignore` нет `.env`, добавить строку `server/.env`.

---

## Task 3: Prisma — модель User и миграция

**Files:**
- Create: `server/prisma/schema.prisma`
- Create: `server/src/db.ts`

- [ ] **Step 1: Создать `server/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  username     String   @unique
  passwordHash String
  avatarKey    String?
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 2: Применить миграцию (docker должен быть запущен)**

Run:
```bash
cd server
bunx prisma migrate dev --name init
```
Expected: создана миграция, таблица `User` в Postgres, сгенерирован `@prisma/client`.

- [ ] **Step 3: Создать синглтон `server/src/db.ts`**

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Commit**

```bash
git add server/prisma server/src/db.ts
git commit -m "feat: Prisma-модель User и клиент"
```

---

## Task 4: Хеширование паролей (TDD)

**Files:**
- Create: `server/src/lib/password.ts`
- Test: `server/src/lib/password.test.ts`

- [ ] **Step 1: Написать падающий тест**

`server/src/lib/password.test.ts`:
```ts
import { describe, expect, it } from 'bun:test';
import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('хеш отличается от исходного пароля', async () => {
    const hash = await hashPassword('s3cret-pass');
    expect(hash).not.toBe('s3cret-pass');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('verify проходит для верного пароля', async () => {
    const hash = await hashPassword('s3cret-pass');
    expect(await verifyPassword('s3cret-pass', hash)).toBe(true);
  });

  it('verify не проходит для неверного пароля', async () => {
    const hash = await hashPassword('s3cret-pass');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Запустить тест — должен упасть**

Run: `cd server && bun test src/lib/password.test.ts`
Expected: FAIL — модуль `./password` не найден.

- [ ] **Step 3: Реализовать `server/src/lib/password.ts`**

```ts
export function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: 'argon2id' });
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return Bun.password.verify(password, hash);
}
```

- [ ] **Step 4: Запустить тест — должен пройти**

Run: `cd server && bun test src/lib/password.test.ts`
Expected: PASS (3 теста).

- [ ] **Step 5: Commit**

```bash
git add server/src/lib/password.ts server/src/lib/password.test.ts
git commit -m "feat: хеширование паролей (argon2id)"
```

---

## Task 5: Cookie-сессия (хелперы опций)

**Files:**
- Create: `server/src/lib/session.ts`

> JWT подписывается плагином `@elysiajs/jwt` внутри роутов (Task 8-10). Здесь — только имя cookie и опции, чтобы не дублировать их по роутам.

- [ ] **Step 1: Создать `server/src/lib/session.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add server/src/lib/session.ts
git commit -m "feat: опции сессионной cookie"
```

---

## Task 6: Хранилище аватаров (Bun.s3)

**Files:**
- Create: `server/src/lib/storage.ts`
- Test: `server/src/lib/storage.test.ts`

- [ ] **Step 1: Написать падающий тест на чистые хелперы**

`server/src/lib/storage.test.ts`:
```ts
import { describe, expect, it } from 'bun:test';
import { buildAvatarKey, assertImage, MAX_AVATAR_BYTES } from './storage';

describe('storage helpers', () => {
  it('buildAvatarKey берёт расширение из имени файла', () => {
    const key = buildAvatarKey('photo.PNG');
    expect(key.endsWith('.png')).toBe(true);
    expect(key).not.toContain('/'); // плоский ключ в бакете
  });

  it('buildAvatarKey по умолчанию даёт .bin без расширения', () => {
    expect(buildAvatarKey('noext').endsWith('.bin')).toBe(true);
  });

  it('assertImage пропускает image/* в пределах лимита', () => {
    const file = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' });
    expect(() => assertImage(file)).not.toThrow();
  });

  it('assertImage кидает на не-картинку', () => {
    const file = new File([new Uint8Array(10)], 'a.txt', { type: 'text/plain' });
    expect(() => assertImage(file)).toThrow();
  });

  it('assertImage кидает при превышении размера', () => {
    const big = new File([new Uint8Array(MAX_AVATAR_BYTES + 1)], 'a.png', { type: 'image/png' });
    expect(() => assertImage(big)).toThrow();
  });
});
```

- [ ] **Step 2: Запустить тест — должен упасть**

Run: `cd server && bun test src/lib/storage.test.ts`
Expected: FAIL — модуль `./storage` не найден.

- [ ] **Step 3: Реализовать `server/src/lib/storage.ts`**

```ts
import { S3Client } from 'bun';

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 МБ

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET,
  region: 'us-east-1',
});

/** Плоский ключ объекта: <cuid-подобный>.<ext>. */
export function buildAvatarKey(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const ext = dot > -1 ? filename.slice(dot + 1).toLowerCase() : 'bin';
  return `${crypto.randomUUID()}.${ext}`;
}

/** Валидация: только image/* и не больше лимита. Кидает Error при нарушении. */
export function assertImage(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new Error('Файл должен быть изображением');
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('Изображение больше 2 МБ');
  }
}

/** Загружает файл в MinIO, возвращает ключ объекта. */
export async function uploadAvatar(file: File): Promise<string> {
  assertImage(file);
  const key = buildAvatarKey(file.name);
  await s3.write(key, file);
  return key;
}

/** Presigned GET URL для чтения аватара (1 час). */
export function getAvatarUrl(key: string | null): string | null {
  if (!key) return null;
  return s3.presign(key, { method: 'GET', expiresIn: 3600 });
}
```

- [ ] **Step 4: Запустить тест — должен пройти**

Run: `cd server && bun test src/lib/storage.test.ts`
Expected: PASS (5 тестов). `uploadAvatar`/`getAvatarUrl` против реального MinIO проверяем вручную в Task 11.

- [ ] **Step 5: Commit**

```bash
git add server/src/lib/storage.ts server/src/lib/storage.test.ts
git commit -m "feat: загрузка аватаров в MinIO (Bun.s3)"
```

---

## Task 7: TypeBox-схемы запросов

**Files:**
- Create: `server/src/schemas/auth.ts`

- [ ] **Step 1: Создать `server/src/schemas/auth.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add server/src/schemas/auth.ts
git commit -m "feat: схемы валидации auth-запросов"
```

---

## Task 8: Роуты auth + Elysia app (register/login/logout/me)

**Files:**
- Create: `server/src/routes/auth.ts`
- Create: `server/src/index.ts`
- Test: `server/src/routes/auth.test.ts`

> Роуты тестируются интеграционно через `app.handle(new Request(...))` против Postgres из docker. Тест чистит таблицу `User` перед каждым кейсом.

- [ ] **Step 1: Создать Elysia app `server/src/index.ts`**

```ts
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
```

- [ ] **Step 2: Создать роуты `server/src/routes/auth.ts`**

```ts
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { prisma } from '../db';
import { hashPassword, verifyPassword } from '../lib/password';
import { uploadAvatar, getAvatarUrl } from '../lib/storage';
import { SESSION_COOKIE, sessionCookieOptions } from '../lib/session';
import { registerBody, loginBody } from '../schemas/auth';

type PublicUser = { id: string; email: string; username: string; avatarUrl: string | null };

function toPublicUser(u: { id: string; email: string; username: string; avatarKey: string | null }): PublicUser {
  return { id: u.id, email: u.email, username: u.username, avatarUrl: getAvatarUrl(u.avatarKey) };
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
    const token = cookie[SESSION_COOKIE].value;
    const payload = token ? await jwt.verify(token) : false;
    if (!payload || typeof payload.sub !== 'string') {
      set.status = 401;
      return { error: 'Не авторизован' };
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      set.status = 401;
      return { error: 'Не авторизован' };
    }
    return { user: toPublicUser(user) };
  });
```

- [ ] **Step 3: Написать интеграционный тест `server/src/routes/auth.test.ts`**

```ts
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
```

- [ ] **Step 4: Запустить тесты — должны пройти (docker запущен)**

Run: `cd server && bun test src/routes/auth.test.ts`
Expected: PASS (6 тестов). Если падает на подключении к БД — проверить `docker compose up -d` и `DATABASE_URL`.

- [ ] **Step 5: Запустить весь набор бэкенд-тестов**

Run: `cd server && bun test`
Expected: PASS (password 3 + storage 5 + routes 6).

- [ ] **Step 6: Ручная проверка сервера и MinIO**

Run: `cd server && bun run dev` (в отдельном терминале).
Проверка: `curl http://localhost:3001/health` → `{"ok":true}`. Затем зарегистрировать с файлом:
```bash
curl -i -F email=b@b.com -F username=trinity -F password=password123 -F avatar=@/path/to/test.png http://localhost:3001/auth/register
```
Expected: 200, в ответе `avatarUrl` — presigned ссылка на `localhost:9000`, которая открывает картинку в браузере; объект виден в бакете `avatars` в консоли MinIO.

- [ ] **Step 7: Commit**

```bash
git add server/src/index.ts server/src/routes/auth.ts server/src/routes/auth.test.ts
git commit -m "feat: роуты register/login/logout/me на Elysia"
```

---

## Task 9: Фронт — API-клиент и схемы

**Files:**
- Create: `src/app/auth/api.ts`
- Create: `src/app/auth/schemas.ts`
- Modify: `.env.local`

- [ ] **Step 1: Добавить переменную окружения**

В `.env.local` добавить строку:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 2: Установить zod**

Run: `pnpm add zod`

- [ ] **Step 3: Создать `src/app/auth/schemas.ts`**

```ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Минимум 3 символа').max(32, 'Максимум 32 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

- [ ] **Step 4: Создать `src/app/auth/api.ts`**

```ts
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
```

- [ ] **Step 5: Проверка типов**

Run: `pnpm exec tsc --noEmit`
Expected: без ошибок в новых файлах.

- [ ] **Step 6: Commit**

```bash
git add src/app/auth/api.ts src/app/auth/schemas.ts .env.local
git commit -m "feat: фронт API-клиент авторизации"
```

---

## Task 10: Компонент CyberInput

**Files:**
- Create: `src/components/ui/CyberInput.tsx`

- [ ] **Step 1: Создать `src/components/ui/CyberInput.tsx`**

```tsx
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-tech uppercase tracking-widest text-cyan-300/80">
            {label}
          </label>
        )}
        <input
          {...props}
          id={id}
          ref={ref}
          className={cn(
            'w-full min-w-0 h-[40px] px-3 py-0',
            'border text-cyan-100 placeholder:text-cyan-300/40 font-tech',
            'caret-cyan-300 outline-none transition-all duration-300 ease-out',
            error ? 'border-[#FF2BD6]' : 'border-cyan-300/60 focus:border-cyan-300',
            'focus:shadow-[0_0_5px_#22d3ee,0_0_15px_#22d3ee,0_0_30px_rgba(34,211,238,0.5)]',
            className,
          )}
          style={{ background: 'rgba(0, 0, 0, 0.55)' }}
        />
        {error && <span className="text-xs font-tech text-[#FF2BD6]">{error}</span>}
      </div>
    );
  },
);

CyberInput.displayName = 'CyberInput';

export default CyberInput;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/CyberInput.tsx
git commit -m "feat: компонент CyberInput"
```

---

## Task 11: Страница /auth (табы Вход/Регистрация)

**Files:**
- Create: `src/app/auth/page.tsx`

- [ ] **Step 1: Создать `src/app/auth/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from 'react-query';
import { cn } from '@/lib/utils';
import styles from '../cyberpunk-style.module.css';
import CyberInput from '@/components/ui/CyberInput';
import CyberButton from '@/components/ui/CyberButton';
import { login, register } from './api';
import { loginSchema, registerSchema } from './schemas';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      if (tab === 'login') {
        const parsed = loginSchema.safeParse({ email: form.email, password: form.password });
        if (!parsed.success) {
          throw { fields: fieldErrors(parsed.error) };
        }
        return login(parsed.data);
      }
      const parsed = registerSchema.safeParse(form);
      if (!parsed.success) {
        throw { fields: fieldErrors(parsed.error) };
      }
      return register(parsed.data, avatar);
    },
    onSuccess: async () => {
      setErrors({});
      await qc.invalidateQueries(['me']);
      router.push('/');
    },
    onError: (e: unknown) => {
      if (e && typeof e === 'object' && 'fields' in e) {
        setErrors((e as { fields: Record<string, string> }).fields);
      } else {
        setErrors({ _form: e instanceof Error ? e.message : 'Ошибка' });
      }
    },
  });

  const onAvatar = (file: File | null) => {
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className={cn(styles['cp-root'], 'min-h-screen flex items-center justify-center p-4')}>
      <div className={styles['cp-scanlines']} />
      <div className="relative w-full max-w-md">
        {/* неон-рамка */}
        <span className="absolute inset-0 border border-[#00F0FF]" />
        <span className="absolute bottom-[-4px] right-[-4px] w-full h-full border border-[#7C3AED]" />
        <div className="relative bg-[#020617]/80 p-8 flex flex-col gap-6">
          <h1
            className="text-2xl font-orbitron font-black text-[#00F0FF] tracking-widest"
            style={{ textShadow: '2px 0 0 #fff, 4px 0 0 #FF2BD6' }}
          >
            ACCESS://AUTH
          </h1>

          {/* табы */}
          <div className="flex gap-2">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setErrors({}); }}
                className={cn(
                  'flex-1 py-2 font-orbitron uppercase text-xs tracking-widest border transition-all',
                  tab === t
                    ? 'border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_#00F0FF66]'
                    : 'border-cyan-300/30 text-cyan-300/50 hover:text-cyan-300',
                )}
              >
                {t === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {errors._form && (
            <div className="border border-[#FF2BD6] text-[#FF2BD6] text-sm font-tech p-2">{errors._form}</div>
          )}

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
          >
            {tab === 'register' && (
              <CyberInput
                id="username"
                label="Username"
                placeholder="neo"
                value={form.username}
                error={errors.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            )}
            <CyberInput
              id="email"
              label="Email"
              type="email"
              placeholder="user@neon.news"
              value={form.email}
              error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <CyberInput
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {tab === 'register' && (
              <div className="flex items-center gap-3">
                {avatarPreview && (
                  <img src={avatarPreview} alt="avatar" className="w-12 h-12 object-cover border border-[#00F0FF]" />
                )}
                <label className="text-xs font-tech uppercase tracking-widest text-cyan-300/80 cursor-pointer border border-cyan-300/40 px-3 py-2 hover:border-cyan-300">
                  Upload avatar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onAvatar(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            )}

            <CyberButton>
              <span className="text-sm font-tech">
                {mutation.isLoading ? 'Loading…' : tab === 'login' ? 'Sign in' : 'Create account'}
              </span>
            </CyberButton>
          </form>
        </div>
      </div>
    </div>
  );
}

function fieldErrors(err: import('zod').ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) out[key] = issue.message;
  }
  return out;
}
```

> Примечание: `CyberButton` отправляет форму как обычный `<button type="submit">` внутри `<form>` (у него нет явного `type`, по умолчанию `submit`).

- [ ] **Step 2: Проверка типов**

Run: `pnpm exec tsc --noEmit`
Expected: без ошибок.

- [ ] **Step 3: Ручная проверка**

Запустить фронт (`pnpm dev`) и бэкенд (`cd server && bun run dev`) + docker.
Открыть http://localhost:3000/auth → форма в киберстиле. Зарегистрироваться (с аватаром) → редирект на `/`. Проверить во вкладке Network, что `set-cookie session=` пришла.

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/page.tsx
git commit -m "feat: киберпанк-страница авторизации /auth"
```

---

## Task 12: Кнопка в шапке Subscribe → Auth

**Files:**
- Modify: `src/app/component/LogoContent.tsx`

- [ ] **Step 1: Обновить `src/app/component/LogoContent.tsx`**

Сделать клиентским и навесить навигацию. Полная новая версия файла:
```tsx
'use client';

import { useRouter } from 'next/navigation';
import CyberButton from '@/components/ui/CyberButton';
import { LightStrikeIcon } from '@/shared/icons/LightStrike';

const LogoContent = () => {
  const router = useRouter();
  return (
    <div className="flex items-center w-full px-3 md:px-6 py-2 justify-between gap-2 flex-wrap">
      <div className="flex items-center min-w-0 [&>svg]:w-14 [&>svg]:h-14 md:[&>svg]:w-[84px] md:[&>svg]:h-[84px] [&>svg]:shrink-0">
        <LightStrikeIcon width={84} height={84} />
        <div className="flex flex-col items-start justify-center min-w-0">
          <h1
            className="text-[22px] sm:text-[28px] md:text-[36px] font-orbitron font-black text-[#00F0FF]"
            style={{
              letterSpacing: '1.5px',
              textShadow: ['2px 0px 0px white', '4px 0px 0px #FF2BD6'].join(', '),
            }}
          >
            NEON://NEWS
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-tech truncate">
            v7.3.1 — decentralized news protocol
          </p>
        </div>
      </div>
      <CyberButton onClick={() => router.push('/auth')}>
        <span className="text-sm font-tech">Auth</span>
      </CyberButton>
    </div>
  );
};

export default LogoContent;
```

- [ ] **Step 2: Проверка типов**

Run: `pnpm exec tsc --noEmit`
Expected: без ошибок.

- [ ] **Step 3: Ручная проверка**

На главной http://localhost:3000 кнопка в шапке теперь «Auth», клик ведёт на `/auth`.

- [ ] **Step 4: Commit**

```bash
git add src/app/component/LogoContent.tsx
git commit -m "feat: кнопка Auth в шапке ведёт на /auth"
```

---

## Task 13: Финальная проверка флоу

- [ ] **Step 1: Прогнать все бэкенд-тесты**

Run: `cd server && bun test`
Expected: все тесты PASS.

- [ ] **Step 2: Проверка типов фронта**

Run: `pnpm exec tsc --noEmit`
Expected: без ошибок.

- [ ] **Step 3: E2E вручную**

При запущенных docker + бэкенд + фронт:
1. `/auth` → Register (username+email+password+avatar) → редирект `/`.
2. Открыть `/auth` → Login тем же email/password → редирект `/`.
3. В DevTools проверить cookie `session` (httpOnly).
4. В консоли MinIO — объект аватара в бакете `avatars`.
5. Неверный пароль на Login → сообщение об ошибке, без редиректа.

---

## Self-Review (для автора плана)

- **Покрытие спеки:** docker-compose+MinIO (T1), User+Prisma (T3), password (T4), session cookie (T5), storage/Bun.s3 (T6), схемы (T7), роуты register/login/logout/me (T8), фронт api (T9), CyberInput (T10), страница табов+avatar (T11), кнопка Auth (T12). Все разделы спеки покрыты.
- **Стратегия сессии:** stateless JWT в cookie — T5/T8.
- **Тесты:** password, storage-хелперы, интеграционные роуты — T4/T6/T8; фронт — ручная проверка T11/T12/T13.
