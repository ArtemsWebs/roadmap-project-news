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
            <div className="border border-[#FF2BD6] text-[#FF2BD6] text-sm font-tech p-2">{errors._form}</div>
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
                  // eslint-disable-next-line @next/next/no-img-element
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
