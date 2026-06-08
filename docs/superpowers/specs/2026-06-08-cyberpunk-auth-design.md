# Дизайн: Авторизация (Elysia + Bun) для NEON://NEWS

Дата: 2026-06-08
Проект: `roadmap-project-news` (Next.js 16 фронт + новый бэкенд на Elysia/Bun)

## Цель

1. Страница авторизации `/auth` в киберпанк-стилистике проекта (табы Вход/Регистрация).
2. Кнопка в шапке: `Subscribe` → `Auth`, по клику ведёт на `/auth`.
3. Полноценная авторизация: отдельный бэкенд на Elysia + Bun, Prisma + Postgres, сессии через JWT в httpOnly-cookie.

## Зафиксированные решения

| Решение | Выбор |
|---|---|
| Объём | Полноценная auth (register/login/logout/me) |
| UI | Табы Вход + Регистрация |
| Кнопка «Auth» | Навигация на `/auth` |
| Бэкенд | Elysia.js + Bun, папка `server/` внутри репо |
| ORM / БД | Prisma + Postgres |
| JWT | `@elysiajs/jwt` |
| CORS | `@elysiajs/cors`, `credentials: true` |
| Хеш паролей | Нативный `Bun.password` (argon2id) |
| Транспорт токена | httpOnly cookie + CORS |
| Стратегия сессии | Stateless JWT (7 дней), без таблицы сессий |
| Валидация | Бэкенд — Elysia TypeBox (`t.Object`); фронт — zod |
| **username** | Обязательный, уникальный; вход по email |
| **avatar** | Загрузка при регистрации (опционально), хранение в MinIO (S3) |
| **S3-хранилище** | MinIO локально (docker-compose), клиент — нативный `Bun.s3` |
| **Загрузка avatar** | Через бэкенд (multipart) → приватный бакет → presigned GET URL на чтение |
| Тесты | Бэкенд — `bun test` (auth-ядро + роуты); фронт — ручная проверка |

## Архитектура

```
roadmap-project-news/
├─ docker-compose.yml       # Postgres + MinIO для локальной разработки
├─ src/                     # существующий Next.js фронт (порт :3000)
│  ├─ app/auth/page.tsx     # новая страница авторизации
│  ├─ app/auth/api.ts       # fetch-обёртки к бэкенду (credentials: 'include')
│  ├─ app/component/LogoContent.tsx   # кнопка Auth → /auth
│  └─ components/ui/CyberInput.tsx    # новый неоновый инпут
└─ server/                  # новый бэкенд Elysia + Bun (порт :3001)
   ├─ package.json
   ├─ tsconfig.json
   ├─ .env                  # DATABASE_URL, JWT_SECRET, FRONTEND_ORIGIN, S3_*
   ├─ prisma/schema.prisma  # модель User
   └─ src/
      ├─ index.ts           # Elysia app: cors + jwt + роуты
      ├─ db.ts              # синглтон Prisma client
      ├─ lib/password.ts    # hash/verify через Bun.password
      ├─ lib/session.ts     # имя cookie + опции + set/clear
      ├─ lib/storage.ts     # Bun.s3 клиент: upload + presigned GET (MinIO)
      ├─ schemas/auth.ts    # TypeBox-схемы тел запросов
      └─ routes/auth.ts     # register / login / logout / me
```

Фронт (`:3000`) ходит на бэкенд (`:3001`) через `NEXT_PUBLIC_API_URL` с `credentials: 'include'`.
Инфраструктура (Postgres `:5432`, MinIO `:9000`/консоль `:9001`) поднимается `docker compose up -d`.

## Бэкенд (`server/`)

### Зависимости
- `elysia`, `@elysiajs/cors`, `@elysiajs/jwt`
- `@prisma/client` (+ dev `prisma`)
- Хеш — встроенный `Bun.password` (зависимость не нужна)
- S3/MinIO — встроенный `Bun.s3` (зависимость не нужна)

### Prisma (`prisma/schema.prisma`)
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  username     String   @unique
  passwordHash String
  avatarKey    String?  // ключ объекта в MinIO (не URL); URL генерируем presigned
  createdAt    DateTime @default(now())
}
```
Миграция: `bunx prisma migrate dev`.

> `name` из исходной модели заменён на `username` (обязательный, уникальный). `avatarKey` хранит ключ объекта в бакете, а не публичный URL.

### Elysia app (`src/index.ts`)
- `cors({ origin: FRONTEND_ORIGIN, credentials: true })`
- `jwt({ name: 'jwt', secret: JWT_SECRET, exp: '7d' })`
- Cookie через встроенный контекст Elysia (`cookie.session`)
- Маунт роутов `/auth`

### Роуты (`src/routes/auth.ts`)
| Метод | Путь | Поведение | Ошибки |
|---|---|---|---|
| POST | `/auth/register` | multipart: валидация → проверка уникальности email и username → (если есть файл) загрузка avatar в MinIO → `Bun.password.hash` (argon2id) → создание → JWT → set cookie → `{ user }` | 400 валидация/файл, 409 email/username заняты |
| POST | `/auth/login` | Валидация → поиск по email → `Bun.password.verify` → JWT → set cookie → `{ user }` | 400 валидация, 401 неверные данные (общая ошибка) |
| POST | `/auth/logout` | Очистка cookie | — |
| GET | `/auth/me` | Чтение cookie → verify JWT → загрузка пользователя → `{ user }` | 401 без сессии |

`user` в ответах = `{ id, email, username, avatarUrl }`, где `avatarUrl` — presigned GET URL (или `null`, если аватара нет). `passwordHash` и сырой `avatarKey` наружу не отдаём.

### Хранилище аватаров (`src/lib/storage.ts`)
- Клиент — нативный `Bun.s3` (`Bun.S3Client`) с `endpoint`, `accessKeyId`, `secretAccessKey`, `bucket`, `region: 'us-east-1'`, форс path-style для MinIO.
- `uploadAvatar(file): Promise<string>` — валидация (тип `image/*`, лимит ~2 МБ), генерация ключа `{cuid}.{ext}`, `client.write(key, file)`, возврат ключа.
- `getAvatarUrl(key): string` — `client.presign(key, { expiresIn: 3600, method: 'GET' })`.
- Бакет `avatars` приватный. `Bun.s3` работает на уровне объектов и **не создаёт бакеты** — бакет создаётся init-контейнером `mc` в docker-compose (см. ниже), не в коде.

### Сессия / cookie (`src/lib/session.ts`)
- Имя: `session`; значение — подписанный JWT с payload `{ sub: userId, email }`.
- Опции: `httpOnly: true`, `sameSite: 'lax'`, `secure` (в prod), `path: '/'`, `maxAge: 7d`.
- Локально оба на `localhost` (разные порты = same-site) → `lax` достаточно; в prod на разных доменах → `sameSite: 'none' + secure`.

### Валидация (`src/schemas/auth.ts`)
- `registerBody = t.Object({ email: t.String({ format: 'email' }), username: t.String({ minLength: 3, maxLength: 32 }), password: t.String({ minLength: 8 }), avatar: t.Optional(t.File({ type: 'image', maxSize: '2m' })) })` — приём через `multipart/form-data`.
- `loginBody = t.Object({ email: t.String({ format: 'email' }), password: t.String({ minLength: 1 }) })`

## Фронтенд (Next.js)

### `src/app/auth/api.ts`
fetch-обёртки `register / login / logout / fetchMe` → `${NEXT_PUBLIC_API_URL}/auth/...`, всегда `credentials: 'include'`. Нормализация ошибок в `{ message, fields? }`.

### Состояние авторизации
React Query (уже подключён): `useQuery(['me'], fetchMe)` + мутации login/register. После успеха — `invalidate(['me'])` и `router.push('/')`.

### Страница `/auth` (`src/app/auth/page.tsx`, client)
- Фон: переиспользовать `cp-root` + `cp-scanlines` из `cyberpunk-style.module.css`.
- Центрированная карточка с неон-рамкой (циан + фиолетовое смещение, как у `CyberButton`); заголовок Orbitron в духе `ACCESS://AUTH`.
- Сегментный переключатель **LOGIN / REGISTER** в киберстиле — рендерит соответствующую форму.
- Поля:
  - **LOGIN**: email, password.
  - **REGISTER**: username, email, password + опциональная загрузка avatar (превью выбранного изображения).
- Поля через `CyberInput`; клиентская валидация zod; инлайн-ошибки мадженто `#FF2BD6`.
- Регистрация отправляет `FormData` (multipart) с файлом; login — JSON.
- Сабмит — `CyberButton`; загрузка — `CyberLoader`; баннер ошибки сверху формы.
- Успех → `router.push('/')`.

### `src/components/ui/CyberInput.tsx`
Неоновый инпут на основе стиля `CyberSearch` (чёрный фон, циан-рамка `border-cyan-300/60`, glow на фокусе), с пропсами `label`, `error`, прокидыванием `...props`.

### `src/app/component/LogoContent.tsx`
Сделать клиентским (`'use client'`), текст кнопки `Subscribe` → `Auth`, `onClick={() => router.push('/auth')}`.

## Инфраструктура (`docker-compose.yml`)
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
  # одноразовый init: создаёт приватный бакет avatars
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

## Конфигурация / env
- `server/.env`:
  - `DATABASE_URL=postgresql://news:news@localhost:5432/news`
  - `JWT_SECRET=<секрет>`
  - `FRONTEND_ORIGIN=http://localhost:3000`
  - `S3_ENDPOINT=http://localhost:9000`, `S3_ACCESS_KEY=minioadmin`, `S3_SECRET_KEY=minioadmin`, `S3_BUCKET=avatars`
- Фронт `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Порты: фронт `:3000`, бэкенд `:3001`, Postgres `:5432`, MinIO API `:9000` / консоль `:9001`.

## Тестирование
- **Бэкенд (`bun test`):**
  - `password.ts` — hash/verify round-trip, неверный пароль не проходит.
  - JWT — sign/verify, истёкший/битый токен отклоняется.
  - `storage.ts` — генерация ключа и валидация типа/размера файла (мокаем `Bun.s3` или тестируем чистые хелперы; реальную загрузку проверяем вручную против поднятого MinIO).
  - Роуты — через `app.handle(new Request(...))`: register (с файлом и без) → 200 + cookie; повтор email/username → 409; login верный/неверный; me с/без cookie.
  - Пишем по TDD (тест до реализации).
- **Фронт:** ручная проверка флоу в запущенном приложении (регистрация с аватаром → редирект → me показывает avatarUrl; logout).

## Вне объёма (YAGNI)
- Refresh-токены / таблица сессий.
- Middleware-защита роутов (нет защищённых страниц).
- OAuth / соц-вход.
- Сброс пароля, верификация email.
- Rate limiting (отметить как будущее усиление безопасности).
