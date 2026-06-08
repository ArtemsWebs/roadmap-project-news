'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from 'react-query';
import { cn } from '@/lib/utils';
import styles from '../cyberpunk-style.module.css';
import ui from './auth.module.css';
import CyberInput from '@/components/ui/CyberInput';
import CyberButton from '@/components/ui/CyberButton';
import MatrixRain from './MatrixRain';
import { login, register } from './api';
import { loginSchema, registerSchema } from './schemas';

type Tab = 'login' | 'register';

const BOOT_LINES = [
  '> INIT BREACH PROTOCOL ............ OK',
  '> UPLINK ARASAKA::NETWATCH ........ OK',
  '> SCANNING RELIC BIOCHIP ......... OK',
  '> VOIGHT-KAMPFF CALIBRATION ...... OK',
  '> NEXUS-6 REPLICANT SCAN ......... PASS',
  '> ICE LAYER 07 BYPASS ............ OK',
  '> TRACE: NIGHT CITY / WATSON ..... LOCKED',
];

const QUOTES = [
  'All those moments will be lost in time, like tears in rain.',
  'Wake up, samurai. We have a city to burn.',
  'More human than human is our motto.',
  'I have seen things you people would not believe.',
  'Never fade away.',
];

const CORPS = ['ARASAKA', 'TYRELL CORP', 'MILITECH'];

export default function AuthPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<
    'username' | 'email' | 'password' | null
  >(null);
  const [caret, setCaret] = useState(0);

  // стримящийся breach-лог
  const [visibleLines, setVisibleLines] = useState(0);
  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) return;
    const id = setTimeout(() => setVisibleLines((n) => n + 1), 420);
    return () => clearTimeout(id);
  }, [visibleLines]);

  // ротация цитат
  const [quote, setQuote] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setQuote((q) => (q + 1) % QUOTES.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  // эхо ввода и ошибок в левую консоль
  const bootDone = visibleLines >= BOOT_LINES.length;
  const echoFields: {
    key: 'username' | 'email' | 'password';
    label: string;
    value: string;
    masked: boolean;
  }[] = bootDone
    ? [
        ...(tab === 'register'
          ? [
              {
                key: 'username' as const,
                label: 'Username',
                value: form.username,
                masked: false,
              },
            ]
          : []),
        {
          key: 'email' as const,
          label: 'Email',
          value: form.email,
          masked: false,
        },
        {
          key: 'password' as const,
          label: 'Password',
          value: form.password,
          masked: true,
        },
      ]
    : [];
  const errorLines: string[] = [];
  if (errors._form) errorLines.push(`> ERR..... ${errors._form.toUpperCase()}`);
  for (const [k, v] of Object.entries(errors)) {
    if (k !== '_form')
      errorLines.push(`> ERR[${k.toUpperCase()}]..... ${v.toUpperCase()}`);
  }

  // авто-скролл консоли вниз
  const consoleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [
    visibleLines,
    echoFields.length,
    errorLines.length,
    form.email,
    form.username,
    form.password,
    activeField,
    caret,
  ]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (tab === 'login') {
        const parsed = loginSchema.safeParse({
          email: form.email,
          password: form.password,
        });
        if (!parsed.success) throw { fields: fieldErrors(parsed.error) };
        return login(parsed.data);
      }
      const parsed = registerSchema.safeParse(form);
      if (!parsed.success) throw { fields: fieldErrors(parsed.error) };
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
        setErrors({
          _form: e instanceof Error ? e.message : 'CONNECTION REFUSED',
        });
      }
    },
  });

  const onAvatar = (file: File | null) => {
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  // привязка инпута к консоли: фокус, позиция каретки, значение
  const bind = (key: 'username' | 'email' | 'password') => ({
    value: form[key],
    error: errors[key],
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      setActiveField(key);
      setCaret(e.target.selectionStart ?? e.target.value.length);
    },
    onBlur: () => setActiveField((p) => (p === key ? null : p)),
    onSelect: (e: React.SyntheticEvent<HTMLInputElement>) =>
      setCaret(e.currentTarget.selectionStart ?? 0),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setCaret(e.target.selectionStart ?? e.target.value.length);
    },
  });

  // строка консоли для поля: курсор на каретке у активного, REQUIRED если активно и пусто
  const renderEcho = (f: (typeof echoFields)[number]) => {
    const dots = `> ${f.label}..... `;
    const isActive = activeField === f.key;

    if (!isActive) {
      // как сейчас: пароль скрыт, если пуст и не активен
      const shown = f.masked ? '•'.repeat(f.value.length) : f.value;
      if (f.value === '') {
        return (
          <div key={f.key} className="text-cyan-200">
            {dots}
            <span className={cn(ui.blink, 'text-[#FF2BD6]')}>REQUIRED</span>
          </div>
        );
      }
      return (
        <div key={f.key} className="text-cyan-200">
          {dots}
          {shown}
        </div>
      );
    }

    const shown = f.masked ? '•'.repeat(f.value.length) : f.value;
    const pos = Math.max(0, Math.min(caret, shown.length));
    return (
      <div key={f.key} className="text-cyan-200">
        {dots}
        {shown.slice(0, pos)}
        <span className={ui.caret} />
        {shown.slice(pos)}
      </div>
    );
  };

  return (
    <div
      className={cn(
        styles['cp-root'],
        'min-h-screen flex flex-col items-center justify-center p-4 gap-3',
      )}
    >
      <MatrixRain />
      <div className={styles['cp-scanlines']} />

      {/* верхняя бегущая строка-предупреждение */}
      <div className="relative z-[2] w-full max-w-[980px] border border-[#FF2BD6]/40 bg-black/50">
        <div className={cn(ui.marqueeMask, 'py-1')}>
          <span
            className={cn(
              ui.marquee,
              'text-[11px] font-tech tracking-widest text-[#FF2BD6]/80 uppercase',
            )}
          >
            ⚠ NETWATCH ALERT · UNAUTHORIZED ACCESS WILL BE TRACED · ARASAKA
            SECURITY ONLINE · NIGHT CITY GRID 2077 · REPLICANTS MUST DECLARE
            NEXUS MODEL · OFF-WORLD VISA REQUIRED ·
          </span>
        </div>
      </div>

      <div className={cn(ui.wrap, ui.flicker)}>
        <span className={cn(ui.bracket, ui.btl)} />
        <span className={cn(ui.bracket, ui.btr)} />
        <span className={cn(ui.bracket, ui.bbl)} />
        <span className={cn(ui.bracket, ui.bbr)} />
        <span className={ui.scanbeam} />

        {/* ===== ЛЕВАЯ ПАНЕЛЬ — INTEL / HUD ===== */}
        <div className={cn(ui.panel, 'flex flex-col gap-5')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#00F0FF] animate-pulse" />
              <span className="text-xs font-tech tracking-widest text-cyan-300/80 uppercase">
                Nexus-6 Identity Gateway
              </span>
            </div>
            <span className="text-[10px] font-tech text-[#FF2BD6]/70">
              v7.3.1
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-orbitron font-black leading-none">
            <span className={ui.glitch} data-text="ACCESS://AUTH">
              ACCESS://AUTH
            </span>
          </h1>

          <p className="text-xs font-tech tracking-[0.25em] text-[#FF2BD6] uppercase">
            ▰ More human than human ▰
          </p>

          {/* статус-строка */}
          <div className="flex flex-wrap gap-2 text-[10px] font-tech uppercase tracking-wider">
            {['Night City', 'Ping 23ms', 'ICE: Active', 'GRID 2077'].map(
              (s) => (
                <span
                  key={s}
                  className="border border-cyan-300/30 text-cyan-300/70 px-2 py-1"
                >
                  {s}
                </span>
              ),
            )}
          </div>

          {/* breach-лог + эхо ввода + ошибки */}
          <div
            ref={consoleRef}
            className="border border-cyan-300/20 bg-black/60 p-3 font-tech text-[11px] leading-relaxed flex-1 min-h-[150px] overflow-y-auto"
          >
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={`b${i}`} className={cn(ui.logline, 'text-[#7CFFB2]')}>
                {line}
              </div>
            ))}

            {echoFields.map(renderEcho)}

            {errorLines.map((line, i) => (
              <div key={`x${i}`} className="text-[#FF2BD6]">
                {line}
              </div>
            ))}

            {visibleLines < BOOT_LINES.length ? (
              <span className={cn(ui.blink, 'text-[#7CFFB2]')}>█</span>
            ) : !activeField ? (
              <span className="text-cyan-300/60">
                {'> '}
                <span className={ui.blink}>_</span>
              </span>
            ) : null}
          </div>

          {/* корп-чипы */}
          <div className="flex flex-wrap gap-2">
            {CORPS.map((c) => (
              <span
                key={c}
                className="text-[10px] font-orbitron tracking-widest uppercase px-2 py-1 border border-[#7C3AED]/50 text-[#b794f6]"
              >
                {c}
              </span>
            ))}
          </div>

          {/* ротация цитат */}
          <p className="mt-auto text-[11px] font-tech italic text-cyan-300/50 border-l-2 border-[#00F0FF]/50 pl-3 min-h-[34px]">
            {'// '}
            {QUOTES[quote]}
          </p>
        </div>

        {/* ===== ПРАВАЯ ПАНЕЛЬ — ФОРМА ===== */}
        <div className={cn(ui.panel, 'flex flex-col gap-5')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech tracking-widest text-cyan-300/80 uppercase">
              {tab === 'login'
                ? '// Voight-Kampff · Sign In'
                : '// New Replicant · Register'}
            </span>
            <span className="text-[10px] font-tech text-[#00F0FF]/60">
              SEC//LVL-7
            </span>
          </div>

          {/* табы */}
          <div className="flex gap-2">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setErrors({});
                }}
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
            <div className="border border-[#FF2BD6] text-[#FF2BD6] text-sm font-tech p-2 flex items-center gap-2">
              <span className="animate-pulse">●</span> {errors._form}
            </div>
          )}

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            {tab === 'register' && (
              <CyberInput
                id="username"
                label="Handle // Username"
                placeholder="V"
                {...bind('username')}
              />
            )}
            <CyberInput
              id="email"
              label="Net Address // Email"
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="netrunner@nightcity.net"
              {...bind('email')}
            />
            <CyberInput
              id="password"
              label="Access Key // Password"
              type="password"
              placeholder="••••••••"
              {...bind('password')}
            />

            {tab === 'register' && (
              <div className="flex items-center gap-3">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-14 h-14 object-cover border border-[#00F0FF] shadow-[0_0_10px_#00F0FF66]"
                  />
                ) : (
                  <div className="w-14 h-14 border border-cyan-300/30 flex items-center justify-center text-[9px] font-tech text-cyan-300/40 text-center leading-tight">
                    NO
                    <br />
                    SIGNAL
                  </div>
                )}
                <label className="text-xs font-tech uppercase tracking-widest text-cyan-300/80 cursor-pointer border border-cyan-300/40 px-3 py-2 hover:border-cyan-300 hover:shadow-[0_0_8px_#00F0FF44] transition-all">
                  Upload ID Photo
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
                {mutation.isLoading
                  ? 'BREACHING…'
                  : tab === 'login'
                    ? '▶ JACK IN'
                    : '▶ INITIALIZE'}
              </span>
            </CyberButton>
          </form>

          <p className="text-[10px] font-tech text-cyan-300/40 leading-relaxed">
            By jacking in you accept the Arasaka EULA and waive all off-world
            liability. Replicants found impersonating humans will be retired.
          </p>
        </div>
      </div>

      <p className="relative z-[2] text-[10px] font-tech text-gray-600 tracking-widest">
        NEON://NEWS · DECENTRALIZED NEWS PROTOCOL · NIGHT CITY DATA HAVEN
      </p>
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
