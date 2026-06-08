# Дизайн: Карточка профиля + страница профиля (NEON://NEWS)

Дата: 2026-06-08
Проект: `roadmap-project-news`

## Цель
1. Карточка профиля (`ProfileCard`) — компактная, в киберпанк-стиле; показывается на главной и на странице статьи.
2. Страница профиля `/profile` — информация о пользователе + статистика по внутренним сущностям проекта.

## Контекст / ограничения
- Серверного трекинга активности нет: `ReactionBar` — локальный `useState` с хардкод-числами, комментарии/аудио без БД-связей. У `User` в БД: `id, email, username, passwordHash, avatarKey, createdAt`.
- На фронте нет глобального auth-состояния; `fetchMe` (`/auth/me`) нигде не используется вне `/auth`.
- Стек: Next.js App Router, React Query (v3), Zustand, Tailwind, киберпанк-стили (`cyberpunk-style.module.css`, `auth.module.css`).

## Решения (утверждены)
| Решение | Выбор |
|---|---|
| Источник статистики | **A — клиентский трекинг** (Zustand + localStorage), реальные действия пользователя |
| Карточка для гостя | Состояние «GUEST» + кнопка **JACK IN** → `/auth`; отдельная кнопка Auth из шапки убирается |
| `createdAt` в `/auth/me` | Добавляется (для «MEMBER SINCE») |

## Архитектура

### 1. Auth-состояние на фронте — `src/app/profile/useMe.ts`
Хук `useMe()` поверх React Query:
```ts
useQuery(['me'], fetchMe, { staleTime: 5*60*1000 })
```
Возвращает `{ user: AuthUser | null, isLoading }`. Используется карточкой, страницей профиля и для инвалидации при logout.

### 2. Стор активности — `src/app/profile/statsStore.ts`
Zustand + `persist` (ключ `neon-news-stats`, localStorage):
- Состояние: `readArticles: string[]` (уникальные uri), `reactions: number`, `ttsListens: number`, `searches: number`
- Экшены: `markRead(uri)` (добавляет uri, если новый), `addReaction()`, `addTtsListen()`, `addSearch()`
- Селектор-хелпер `useStats()` для чтения.

Точки инкремента (вшиваются в существующие компоненты):
| Сущность | Где | Действие |
|---|---|---|
| Прочитанные статьи | `src/app/article/[uri]/page.tsx` | `markRead(uri)` в `useEffect` при маунте |
| Реакции | `src/app/article/components/ReactionBar.tsx` | `addReaction()` в обработчике `react()` (на установку реакции) |
| Прослушки TTS | `src/app/article/components/AudioStream.tsx` | `addTtsListen()` при старте воспроизведения |
| Поиски | модель фильтров / применение keyword | `addSearch()` при применении непустого keyword |

### 3. Компонент `ProfileCard` — `src/components/profile/ProfileCard.tsx`
Компактная карточка (киберпанк: неон-рамка, как у `CyberButton`/auth-карточки):
- Аватар (`avatarUrl`) или плейсхолдер `NO SIGNAL`
- `username`, `email`
- Ряд из 3 мини-метрик: READ / REACT / LISTEN (из `statsStore`)
- Ссылка-переход → `/profile`, иконка LOGOUT
- **Гость** (`user === null`): «GUEST · NOT AUTHENTICATED» + кнопка **JACK IN** → `/auth`
- Проп `variant?: 'header' | 'sidebar'` — компактность/ширина.

Размещение:
- Главная: в `src/app/component/Header.tsx` (справа).
- Статья: в `src/app/article/components/ArticleSidebar.tsx`.
- Из `src/app/component/LogoContent.tsx` убирается отдельная кнопка Auth (роль берёт карточка).

### 4. Страница `/profile` — `src/app/profile/page.tsx` (client)
Фон cp-root + scanlines + `MatrixRain` (переиспользуем). Если `user === null` → блок «ACCESS DENIED» + JACK IN → `/auth`.
Секции:
- **Шапка профиля**: крупный аватар, `username`, `email`, `REPLICANT ID: <id.slice(0,8)>`, `MEMBER SINCE: <createdAt>`
- **Дашборд-плитки** (киберпанк-тайлы):
  - READ ARTICLES (`readArticles.length`)
  - REACTIONS (`reactions`)
  - TTS LISTENS (`ttsListens`)
  - SEARCHES (`searches`)
  - FEED SIZE (`useNewsStore().totalResults` — размер текущей ленты)
  - NETRUNNER LEVEL — вычисляемый ранг: `floor(sqrt(read*2 + reactions + listens*3 + searches))`, с подписью ранга (ROOKIE/RUNNER/ICEBREAKER/LEGEND)
- **ACCESS LOG**: последние ~8 прочитанных uri (из `readArticles`)
- Кнопка **LOGOUT** (вызывает `logout()`, инвалидация `['me']`, редирект на `/`)

### 5. Бэкенд — `createdAt` в публичном пользователе
В `server/src/routes/auth.ts` функция `toPublicUser` добавляет `createdAt` (ISO-строка). На фронте тип `AuthUser` (`src/app/auth/api.ts`) расширяется полем `createdAt: string`.

## Файлы
**Создать:**
- `src/app/profile/useMe.ts`
- `src/app/profile/statsStore.ts`
- `src/components/profile/ProfileCard.tsx`
- `src/app/profile/page.tsx`
- `src/app/profile/profile.module.css` (тайлы/анимации, если нужно)

**Изменить:**
- `server/src/routes/auth.ts` (`toPublicUser` + `createdAt`)
- `src/app/auth/api.ts` (тип `AuthUser`)
- `src/app/component/Header.tsx` (вставить ProfileCard)
- `src/app/component/LogoContent.tsx` (убрать кнопку Auth)
- `src/app/article/components/ArticleSidebar.tsx` (вставить ProfileCard)
- `src/app/article/[uri]/page.tsx` (`markRead`)
- `src/app/article/components/ReactionBar.tsx` (`addReaction`)
- `src/app/article/components/AudioStream.tsx` (`addTtsListen`)
- модель фильтров (применение keyword → `addSearch`)

## Данные / поток
- `useMe()` → React Query кэш (`['me']`), `credentials: 'include'`.
- `statsStore` → localStorage (persist), читается картой и страницей, пишется из компонентов-сущностей.
- LOGOUT → `logout()` + `qc.invalidateQueries(['me'])` + редирект.

## Обработка краёв
- Гость: карточка и страница показывают guest/denied состояния.
- Пустая статистика: плитки показывают 0, ACCESS LOG — «NO ENTRIES».
- Нет аватара: плейсхолдер NO SIGNAL.

## Тестирование
- На фронте раннер тестов отсутствует → проверка ручная (логин → карточка на главной/статье → действия инкрементят метрики → `/profile` отражает; logout).
- `statsStore` — чистые экшены, при желании покрываются позже при добавлении vitest.

## Вне объёма (YAGNI)
- Серверная статистика/таблицы активности.
- Редактирование профиля, смена пароля/аватара.
- Закладки/комментарии-постинг как метрики (нет соответствующего стабильного UI/хранилища).
