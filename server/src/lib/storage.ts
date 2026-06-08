import { S3Client } from 'bun';

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 МБ

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET,
  region: 'us-east-1',
});

/** Плоский ключ объекта: <uuid>.<ext>. */
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
