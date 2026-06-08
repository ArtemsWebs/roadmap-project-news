/**
 * Прокси к F5-TTS микросервису (см. tts-service/).
 * Держит URL сервиса на сервере и стримит WAV в браузер.
 */
const TTS_URL = process.env.TTS_SERVICE_URL ?? 'http://localhost:8800';
const MAX_CHARS = 2000;

export async function POST(req: Request) {
  let text = '';
  try {
    const body = await req.json();
    text = typeof body?.text === 'string' ? body.text : '';
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  text = text.trim().slice(0, MAX_CHARS);
  if (!text) return new Response('text required', { status: 400 });

  let upstream: Response;
  try {
    upstream = await fetch(`${TTS_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch {
    return new Response('tts service unreachable', { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response('tts failed', { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'audio/wav',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
