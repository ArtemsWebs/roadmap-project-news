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
