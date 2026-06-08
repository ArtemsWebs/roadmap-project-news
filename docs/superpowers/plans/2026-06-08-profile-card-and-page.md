# Profile Card & Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить киберпанк-карточку профиля (на главной и странице статьи) и страницу `/profile` с информацией о пользователе и статистикой по внутренним сущностям (клиентский трекинг).

**Architecture:** Auth-состояние на фронте через React Query (`useMe` → `/auth/me`). Активность пользователя считается в Zustand-сторе с persist в localStorage; инкременты вшиваются в существующие компоненты (статья, реакции, TTS, поиск). `ProfileCard` и страница `/profile` читают `useMe` + стор. Бэкенд отдаёт `createdAt` в `/auth/me`.

**Tech Stack:** Next.js App Router, React 19, React Query v3, Zustand (+persist), Tailwind, киберпанк-CSS-модули.

**Spec:** `docs/superpowers/specs/2026-06-08-profile-card-and-page-design.md`

> Примечание по окружению: фронт запускается `pnpm dev` (:3000), бэкенд `cd server && bun run dev` (:3001), инфраструктура `docker compose up -d`. Тест-раннера на фронте нет — проверки ручные. Бэкенд-тесты: `cd server && USERPROFILE='C:\Users\Public' HOME='C:\Users\Public' bun test`.

---

## File Structure

**Создать:**
- `src/app/profile/statsStore.ts` — Zustand+persist стор активности
- `src/app/profile/useMe.ts` — хук текущего пользователя (React Query)
- `src/components/profile/ProfileCard.tsx` — карточка профиля (header/sidebar)
- `src/app/profile/page.tsx` — страница профиля
- `src/app/profile/profile.module.css` — тайлы/сетка дашборда

**Изменить:**
- `server/src/routes/auth.ts` — `createdAt` в `toPublicUser`
- `src/app/auth/api.ts` — поле `createdAt` в типе `AuthUser`
- `src/app/component/Header.tsx` — вставить `ProfileCard variant="header"`
- `src/app/component/LogoContent.tsx` — убрать кнопку Auth
- `src/app/article/components/ArticleSidebar.tsx` — вставить `ProfileCard variant="sidebar"`
- `src/app/article/[uri]/page.tsx` — `markRead(uri)` при загрузке статьи
- `src/app/article/components/ReactionBar.tsx` — `addReaction()`
- `src/app/article/components/AudioStream.tsx` — `addTtsListen()`
- `src/app/component/SearchBlock.tsx` — `addSearch()` при коммите keyword

---

## Task 1: Бэкенд — `createdAt` в публичном пользователе

**Files:**
- Modify: `server/src/routes/auth.ts`
- Test: `server/src/routes/auth.test.ts`

- [ ] **Step 1: Дополнить интеграционный тест — проверка `createdAt`**

В `server/src/routes/auth.test.ts`, в тест «register создаёт пользователя и ставит cookie», после строки `expect(data.user.username).toBe('neo');` добавить:
```ts
    expect(typeof data.user.createdAt).toBe('string');
    expect(Number.isNaN(Date.parse(data.user.createdAt))).toBe(false);
```

- [ ] **Step 2: Запустить тест — должен упасть**

Run: `cd server && USERPROFILE='C:\Users\Public' HOME='C:\Users\Public' bun test src/routes/auth.test.ts`
Expected: FAIL — `data.user.createdAt` is undefined.

- [ ] **Step 3: Добавить `createdAt` в `toPublicUser`**

В `server/src/routes/auth.ts` заменить тип и функцию:
```ts
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
```

- [ ] **Step 4: Запустить тесты — должны пройти**

Run: `cd server && USERPROFILE='C:\Users\Public' HOME='C:\Users\Public' bun test`
Expected: PASS (все тесты, включая обновлённый register).

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/auth.ts server/src/routes/auth.test.ts
git commit -m "feat(server): createdAt в публичном пользователе"
```

---

## Task 2: Фронт — тип `AuthUser` с `createdAt`

**Files:**
- Modify: `src/app/auth/api.ts`

- [ ] **Step 1: Добавить `createdAt` в тип**

В `src/app/auth/api.ts` заменить строку типа:
```ts
export type AuthUser = { id: string; email: string; username: string; avatarUrl: string | null };
```
на:
```ts
export type AuthUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
};
```

- [ ] **Step 2: Проверка типов**

Run: `pnpm exec tsc --noEmit`
Expected: 0 ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/api.ts
git commit -m "feat(auth): createdAt в типе AuthUser"
```

---

## Task 3: Стор активности (statsStore)

**Files:**
- Create: `src/app/profile/statsStore.ts`

- [ ] **Step 1: Создать стор**

`src/app/profile/statsStore.ts`:
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StatsState {
  readArticles: string[]; // уникальные uri прочитанных статей
  reactions: number;
  ttsListens: number;
  searches: number;
  markRead: (uri: string) => void;
  addReaction: () => void;
  addTtsListen: () => void;
  addSearch: () => void;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      readArticles: [],
      reactions: 0,
      ttsListens: 0,
      searches: 0,
      markRead: (uri) =>
        set((s) =>
          uri && !s.readArticles.includes(uri)
            ? { readArticles: [...s.readArticles, uri] }
            : {},
        ),
      addReaction: () => set((s) => ({ reactions: s.reactions + 1 })),
      addTtsListen: () => set((s) => ({ ttsListens: s.ttsListens + 1 })),
      addSearch: () => set((s) => ({ searches: s.searches + 1 })),
    }),
    { name: 'neon-news-stats' },
  ),
);

/** Вычисляемый ранг нетраннера по суммарной активности. */
export function netrunnerLevel(s: {
  readArticles: string[];
  reactions: number;
  ttsListens: number;
  searches: number;
}): { level: number; rank: string } {
  const score =
    s.readArticles.length * 2 + s.reactions + s.ttsListens * 3 + s.searches;
  const level = Math.floor(Math.sqrt(score));
  const rank =
    level >= 12
      ? 'LEGEND'
      : level >= 7
        ? 'ICEBREAKER'
        : level >= 3
          ? 'RUNNER'
          : 'ROOKIE';
  return { level, rank };
}
```

- [ ] **Step 2: Проверка типов**

Run: `pnpm exec tsc --noEmit`
Expected: 0 ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/app/profile/statsStore.ts
git commit -m "feat(profile): стор активности (zustand+persist)"
```

---

## Task 4: Хук текущего пользователя (useMe)

**Files:**
- Create: `src/app/profile/useMe.ts`

- [ ] **Step 1: Создать хук**

`src/app/profile/useMe.ts`:
```ts
import { useQuery } from 'react-query';
import { fetchMe, type AuthUser } from '../auth/api';

export function useMe() {
  const { data, isLoading } = useQuery<AuthUser | null>(['me'], fetchMe, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { user: data ?? null, isLoading };
}
```

- [ ] **Step 2: Проверка типов**

Run: `pnpm exec tsc --noEmit`
Expected: 0 ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/app/profile/useMe.ts
git commit -m "feat(profile): хук useMe (react-query /auth/me)"
```

---

## Task 5: Компонент ProfileCard

**Files:**
- Create: `src/components/profile/ProfileCard.tsx`

- [ ] **Step 1: Создать компонент**

`src/components/profile/ProfileCard.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from 'react-query';
import { LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMe } from '@/app/profile/useMe';
import { useStatsStore } from '@/app/profile/statsStore';
import { logout } from '@/app/auth/api';

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center px-2">
    <span className="font-orbitron font-black text-sm text-cyan-300 leading-none">
      {value}
    </span>
    <span className="font-tech text-[9px] tracking-widest text-cyan-300/50 uppercase">
      {label}
    </span>
  </div>
);

export const ProfileCard = ({
  variant = 'header',
}: {
  variant?: 'header' | 'sidebar';
}) => {
  const { user, isLoading } = useMe();
  const router = useRouter();
  const qc = useQueryClient();
  const reactions = useStatsStore((s) => s.reactions);
  const ttsListens = useStatsStore((s) => s.ttsListens);
  const readCount = useStatsStore((s) => s.readArticles.length);

  const onLogout = async () => {
    await logout();
    await qc.invalidateQueries(['me']);
    router.push('/');
  };

  const width = variant === 'sidebar' ? 'w-full' : 'w-full sm:w-[300px]';

  if (isLoading) {
    return (
      <div className={cn('relative border border-cyan-300/30 bg-black/50 p-3', width)}>
        <span className="font-tech text-xs text-cyan-300/50">LOADING IDENTITY…</span>
      </div>
    );
  }

  // Гость
  if (!user) {
    return (
      <div className={cn('relative border border-cyan-300/40 bg-black/50 p-3 flex items-center justify-between gap-3', width)}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 border border-cyan-300/30 flex items-center justify-center shrink-0">
            <UserIcon className="w-4 h-4 text-cyan-300/50" />
          </div>
          <div className="min-w-0">
            <p className="font-orbitron text-xs text-cyan-300 truncate">GUEST</p>
            <p className="font-tech text-[10px] text-cyan-300/40 truncate">not authenticated</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push('/auth')}
          className="shrink-0 font-orbitron text-[11px] tracking-widest uppercase text-[#00F0FF] border border-[#00F0FF] px-3 py-2 hover:shadow-[0_0_10px_#00F0FF66] transition-all cursor-pointer"
        >
          Jack in
        </button>
      </div>
    );
  }

  // Авторизован
  return (
    <div className={cn('relative border border-cyan-300/40 bg-black/50', width)}>
      <span className="absolute bottom-[-3px] right-[-3px] w-full h-full border border-[#7C3AED]/60 pointer-events-none" />
      <div className="relative flex items-center gap-3 p-3">
        <Link href="/profile" className="shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-10 h-10 object-cover border border-[#00F0FF] shadow-[0_0_8px_#00F0FF66]"
            />
          ) : (
            <div className="w-10 h-10 border border-cyan-300/40 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-cyan-300/60" />
            </div>
          )}
        </Link>

        <Link href="/profile" className="min-w-0 flex-1">
          <p className="font-orbitron text-sm text-cyan-300 truncate hover:text-cyan-100 transition-colors">
            {user.username}
          </p>
          <p className="font-tech text-[10px] text-cyan-300/40 truncate">{user.email}</p>
        </Link>

        <div className="hidden sm:flex items-center border-l border-cyan-300/20 pl-2">
          <Metric label="read" value={readCount} />
          <Metric label="react" value={reactions} />
          <Metric label="tts" value={ttsListens} />
        </div>

        <button
          type="button"
          onClick={onLogout}
          title="Logout"
          className="shrink-0 text-cyan-300/50 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
```

- [ ] **Step 2: Проверка типов и линт**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/components/profile/ProfileCard.tsx`
Expected: 0 ошибок, eslint без замечаний.

- [ ] **Step 3: Commit**

```bash
git add src/components/profile/ProfileCard.tsx
git commit -m "feat(profile): компонент ProfileCard"
```

---

## Task 6: Вставить ProfileCard в шапку и убрать кнопку Auth

**Files:**
- Modify: `src/app/component/Header.tsx`
- Modify: `src/app/component/LogoContent.tsx`

- [ ] **Step 1: Добавить ProfileCard в Header**

В `src/app/component/Header.tsx` добавить импорт после строки `import CrawlLine from './CrawlLine';`:
```tsx
import ProfileCard from '@/components/profile/ProfileCard';
```
И вставить карточку между `<LogoContent />` и `<CrawlLine ... />`:
```tsx
      <LogoContent />
      <div className="flex justify-end px-3 md:px-6 pb-2">
        <ProfileCard variant="header" />
      </div>
      <CrawlLine news={data as NewsApiSuccessResponse} />
```

- [ ] **Step 2: Убрать кнопку Auth из LogoContent**

В `src/app/component/LogoContent.tsx` удалить блок кнопки:
```tsx
      <CyberButton onClick={() => router.push('/auth')}>
        <span className="text-sm font-tech">Auth</span>
      </CyberButton>
```
Затем удалить ставшие неиспользуемыми импорт `CyberButton`, импорт `useRouter` и строку `const router = useRouter();`. Итоговый `LogoContent.tsx`:
```tsx
import { LightStrikeIcon } from '@/shared/icons/LightStrike';

const LogoContent = () => {
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
    </div>
  );
};

export default LogoContent;
```

> Примечание: `LogoContent` больше не использует клиентских хуков, но если в нём остаётся `'use client'` — это безвредно; оставить как есть, чтобы не плодить изменения.

- [ ] **Step 3: Проверка типов и линт**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/app/component/Header.tsx src/app/component/LogoContent.tsx`
Expected: 0 ошибок, без неиспользуемых импортов.

- [ ] **Step 4: Commit**

```bash
git add src/app/component/Header.tsx src/app/component/LogoContent.tsx
git commit -m "feat(profile): ProfileCard в шапке вместо кнопки Auth"
```

---

## Task 7: Вставить ProfileCard в сайдбар статьи

**Files:**
- Modify: `src/app/article/components/ArticleSidebar.tsx`

- [ ] **Step 1: Импортировать ProfileCard**

В `src/app/article/components/ArticleSidebar.tsx` добавить импорт после `import { cn } from '@/lib/utils';`:
```tsx
import ProfileCard from '@/components/profile/ProfileCard';
```

- [ ] **Step 2: Вставить карточку вверху aside**

Заменить открывающий `<aside ...>` и первый комментарий:
```tsx
  return (
    <aside className="flex flex-col gap-4">
      {/* NEURAL_TLDR — выжимка из тела статьи */}
```
на:
```tsx
  return (
    <aside className="flex flex-col gap-4">
      <ProfileCard variant="sidebar" />

      {/* NEURAL_TLDR — выжимка из тела статьи */}
```

- [ ] **Step 3: Проверка типов**

Run: `pnpm exec tsc --noEmit`
Expected: 0 ошибок.

- [ ] **Step 4: Commit**

```bash
git add src/app/article/components/ArticleSidebar.tsx
git commit -m "feat(profile): ProfileCard в сайдбаре статьи"
```

---

## Task 8: Инкременты активности в существующих компонентах

**Files:**
- Modify: `src/app/article/[uri]/page.tsx`
- Modify: `src/app/article/components/ReactionBar.tsx`
- Modify: `src/app/article/components/AudioStream.tsx`
- Modify: `src/app/component/SearchBlock.tsx`

- [ ] **Step 1: markRead при загрузке статьи**

В `src/app/article/[uri]/page.tsx` добавить импорт после `import { readingTime, shortCategory, toParagraphs } from '../lib';`:
```tsx
import { useStatsStore } from '../../profile/statsStore';
```
В компоненте `ArticlePage`, после строки `const info = data?.info;` добавить:
```tsx
  const markRead = useStatsStore((s) => s.markRead);
  useEffect(() => {
    if (info?.uri) markRead(info.uri);
  }, [info?.uri, markRead]);
```
(`useEffect` уже импортирован в этом файле.)

- [ ] **Step 2: addReaction в ReactionBar**

В `src/app/article/components/ReactionBar.tsx` добавить импорт после `import { cn } from '@/lib/utils';`:
```tsx
import { useStatsStore } from '../../profile/statsStore';
```
Внутри компонента, после `const [active, setActive] = useState<string | null>(null);` добавить:
```tsx
  const addReaction = useStatsStore((s) => s.addReaction);
```
В функции `react`, заменить тело так, чтобы считать только установку (не снятие) реакции. Текущее:
```tsx
  const react = (id: string) => {
    setReactions((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const wasActive = active === id;
        return { ...r, count: r.count + (wasActive ? -1 : 1) };
      }),
    );
    setActive((cur) => (cur === id ? null : id));
  };
```
заменить на:
```tsx
  const react = (id: string) => {
    const wasActive = active === id;
    setReactions((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return { ...r, count: r.count + (wasActive ? -1 : 1) };
      }),
    );
    setActive((cur) => (cur === id ? null : id));
    if (!wasActive) addReaction();
  };
```

- [ ] **Step 3: addTtsListen при старте воспроизведения**

В `src/app/article/components/AudioStream.tsx` добавить импорт после `import { Headphones, Square, Loader2 } from 'lucide-react';`:
```tsx
import { useStatsStore } from '../../profile/statsStore';
```
Внутри компонента `AudioStream`, после `const [state, setState] = useState<AudioState>('idle');` добавить:
```tsx
  const addTtsListen = useStatsStore((s) => s.addTtsListen);
```
В функции `play`, сразу после `await audio.play();` и `setState('playing');` добавить вызов:
```tsx
      await audio.play();
      setState('playing');
      addTtsListen();
```

- [ ] **Step 4: addSearch при коммите keyword**

В `src/app/component/SearchBlock.tsx` добавить импорт после `import { useLocationStore } from './location/locationStore';`:
```tsx
import { useStatsStore } from '../profile/statsStore';
```
Внутри компонента, после `const location = useLocationStore((s) => s.location);` добавить:
```tsx
  const addSearch = useStatsStore((s) => s.addSearch);
```
Заменить функцию `commit`:
```tsx
  const commit = () => {
    if (value !== keyword) patchFilters({ keyword: value, page: 1 });
  };
```
на:
```tsx
  const commit = () => {
    if (value !== keyword) {
      patchFilters({ keyword: value, page: 1 });
      if (value.trim()) addSearch();
    }
  };
```

- [ ] **Step 5: Проверка типов и линт**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/app/article/[uri]/page.tsx src/app/article/components/ReactionBar.tsx src/app/article/components/AudioStream.tsx src/app/component/SearchBlock.tsx`
Expected: 0 ошибок.

- [ ] **Step 6: Commit**

```bash
git add "src/app/article/[uri]/page.tsx" src/app/article/components/ReactionBar.tsx src/app/article/components/AudioStream.tsx src/app/component/SearchBlock.tsx
git commit -m "feat(profile): трекинг активности (read/react/tts/search)"
```

---

## Task 9: Стили дашборда профиля

**Files:**
- Create: `src/app/profile/profile.module.css`

- [ ] **Step 1: Создать CSS-модуль**

`src/app/profile/profile.module.css`:
```css
.tiles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: rgba(34, 211, 238, 0.18);
  border: 1px solid rgba(34, 211, 238, 0.35);
}

@media (min-width: 640px) {
  .tiles {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tile {
  background: rgba(2, 6, 23, 0.92);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 96px;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/profile/profile.module.css
git commit -m "feat(profile): стили дашборда профиля"
```

---

## Task 10: Страница /profile

**Files:**
- Create: `src/app/profile/page.tsx`

- [ ] **Step 1: Создать страницу**

`src/app/profile/page.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from 'react-query';
import { ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import styles from '../cyberpunk-style.module.css';
import tiles from './profile.module.css';
import MatrixRain from '../auth/MatrixRain';
import { useMe } from './useMe';
import { useStatsStore, netrunnerLevel } from './statsStore';
import { useNewsStore } from '../news/newsStore';
import { logout } from '../auth/api';

const Tile = ({ label, value }: { label: string; value: string | number }) => (
  <div className={tiles.tile}>
    <span className="font-orbitron font-black text-3xl text-cyan-300 leading-none">
      {value}
    </span>
    <span className="font-tech text-[10px] tracking-widest text-cyan-300/50 uppercase">
      {label}
    </span>
  </div>
);

export default function ProfilePage() {
  const { user, isLoading } = useMe();
  const router = useRouter();
  const qc = useQueryClient();

  const readArticles = useStatsStore((s) => s.readArticles);
  const reactions = useStatsStore((s) => s.reactions);
  const ttsListens = useStatsStore((s) => s.ttsListens);
  const searches = useStatsStore((s) => s.searches);
  const feedSize = useNewsStore((s) => s.totalResults);

  const { level, rank } = netrunnerLevel({
    readArticles,
    reactions,
    ttsListens,
    searches,
  });

  const onLogout = async () => {
    await logout();
    await qc.invalidateQueries(['me']);
    router.push('/');
  };

  return (
    <div className={cn(styles['cp-root'], 'min-h-screen p-4 md:p-8')}>
      <MatrixRain />
      <div className={styles['cp-scanlines']} />

      <div className="relative z-[2] max-w-[980px] mx-auto flex flex-col gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-tech text-xs tracking-widest uppercase text-cyan-300 hover:text-cyan-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {'<< back_to_feed'}
        </Link>

        {isLoading ? (
          <p className="font-tech text-cyan-300/60">LOADING IDENTITY…</p>
        ) : !user ? (
          <div className="border border-rose-400 bg-black/60 p-8 flex flex-col items-start gap-4">
            <p className="font-orbitron text-xl text-rose-400">ACCESS DENIED</p>
            <p className="font-tech text-sm text-cyan-300/60">
              {'// требуется авторизация для доступа к профилю'}
            </p>
            <button
              type="button"
              onClick={() => router.push('/auth')}
              className="font-orbitron text-sm tracking-widest uppercase text-[#00F0FF] border border-[#00F0FF] px-4 py-2 hover:shadow-[0_0_10px_#00F0FF66] transition-all cursor-pointer"
            >
              ▶ Jack in
            </button>
          </div>
        ) : (
          <>
            {/* Шапка профиля */}
            <div className="relative border border-cyan-300/40 bg-black/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <span className="absolute bottom-[-4px] right-[-4px] w-full h-full border border-[#7C3AED]/60 pointer-events-none" />
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-24 h-24 object-cover border border-[#00F0FF] shadow-[0_0_14px_#00F0FF66]"
                />
              ) : (
                <div className="w-24 h-24 border border-cyan-300/40 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-cyan-300/50" />
                </div>
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <h1 className="font-orbitron font-black text-2xl text-cyan-300">
                  {user.username}
                </h1>
                <p className="font-tech text-sm text-cyan-300/60">{user.email}</p>
                <p className="font-tech text-[11px] text-cyan-300/40">
                  REPLICANT ID: {user.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="font-tech text-[11px] text-cyan-300/40">
                  MEMBER SINCE: {formatDate(user.createdAt)}
                </p>
                <p className="font-tech text-[11px] text-[#FF2BD6] mt-1">
                  NETRUNNER LVL {level} · {rank}
                </p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="sm:ml-auto flex items-center gap-2 font-tech text-xs tracking-widest uppercase text-cyan-300/60 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>

            {/* Дашборд */}
            <div>
              <p className="font-tech text-xs tracking-widest text-cyan-300/50 uppercase mb-2">
                {'// activity metrics'}
              </p>
              <div className={tiles.tiles}>
                <Tile label="Read Articles" value={readArticles.length} />
                <Tile label="Reactions" value={reactions} />
                <Tile label="TTS Listens" value={ttsListens} />
                <Tile label="Searches" value={searches} />
                <Tile label="Feed Size" value={feedSize} />
                <Tile label="Netrunner Lvl" value={level} />
              </div>
            </div>

            {/* ACCESS LOG */}
            <div className="border border-cyan-300/20 bg-black/60 p-4">
              <p className="font-tech text-xs tracking-widest text-cyan-300/50 uppercase mb-2">
                {'// access log · recent reads'}
              </p>
              {readArticles.length === 0 ? (
                <p className="font-tech text-xs text-cyan-300/30">NO ENTRIES</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {readArticles
                    .slice(-8)
                    .reverse()
                    .map((uri) => (
                      <li
                        key={uri}
                        className="font-tech text-[11px] text-[#7CFFB2] truncate"
                      >
                        {'> '}
                        {uri}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Проверка типов и линт**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/app/profile/page.tsx`
Expected: 0 ошибок.

- [ ] **Step 3: Ручная проверка флоу**

При запущенных docker + бэкенд (:3001) + фронт (:3000, перезапустить `pnpm dev`):
1. Залогиниться через `/auth` → на главной в шапке появляется ProfileCard с username/аватаром.
2. Открыть статью → в сайдбаре ProfileCard; вернуться — счётчик READ увеличился.
3. Поставить реакцию (REACT↑), нажать LISTEN в AUDIO_STREAM (TTS↑), сделать поиск на главной (SEARCH↑).
4. Открыть `/profile` → шапка с данными (username/email/REPLICANT ID/MEMBER SINCE/уровень), плитки отражают метрики, ACCESS LOG показывает прочитанные uri.
5. LOGOUT → редирект на `/`, карточка показывает GUEST.
6. Открыть `/profile` гостем → блок ACCESS DENIED + JACK IN.

- [ ] **Step 4: Commit**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(profile): страница /profile с дашбордом активности"
```

---

## Self-Review (для автора плана)

- **Покрытие спеки:** useMe (T4), statsStore + инкременты (T3, T8), ProfileCard на главной/статье (T5–T7), страница /profile (T9–T10), createdAt в бэке/типе (T1–T2), убрана кнопка Auth (T6). Все разделы спеки покрыты.
- **Типы/имена:** `useStatsStore`, экшены `markRead/addReaction/addTtsListen/addSearch`, `netrunnerLevel`, `useMe`, `AuthUser.createdAt`, `ProfileCard variant` — согласованы между задачами.
- **Плейсхолдеров нет:** во всех шагах полный код и точные команды.
- **Краевые случаи:** гость/загрузка/нет аватара/пустой ACCESS LOG — покрыты в ProfileCard и /profile.

