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
