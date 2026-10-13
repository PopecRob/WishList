import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Nimród Baby Wishing List – szerveroldali foglalás (v2)
const ALLOWED_ORIGIN = 'https://popecrob.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Vary': 'Origin',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function readLimitedJson(req: Request, limit = 8192): Promise<unknown> {
  if (!req.body) throw new Error('EMPTY_BODY');
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error('TOO_LARGE');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

async function clientHash(ip: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(salt),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    if (req.headers.get('origin') !== ALLOWED_ORIGIN) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') return json({ error: 'Csak POST kérés engedélyezett.' }, 405);
  if (req.headers.get('origin') !== ALLOWED_ORIGIN) return json({ error: 'Nem engedélyezett eredet.' }, 403);
  if (!(req.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return json({ error: 'JSON tartalom szükséges.' }, 415);
  }

  const url = Deno.env.get('SUPABASE_URL');
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const salt = Deno.env.get('RATE_LIMIT_SECRET');
  if (!url || !secret || !salt || salt.length < 32) {
    return json({ error: 'A foglalási szerver beállítása még nem teljes.' }, 503);
  }

  // A Supabase gateway által közvetített IP; az IP-alapú korlát megkerülhető
  // egyes hálózatokból, ezért önmagában nem tekinthető teljes botvédelemnek.
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip')?.trim();
  if (!ip || ip.length > 128) return json({ error: 'Nem ellenőrizhető a kérés forrása.' }, 403);

  const client = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const hash = await clientHash(ip, salt);
    const { data: allowed, error: limitError } = await client.rpc('check_reservation_rate_limit', {
      p_client_hash: hash,
    });
    if (limitError) {
      console.error('Rate limit RPC error:', limitError.code);
      return json({ error: 'A foglalás jelenleg nem elérhető.' }, 503);
    }
    if (allowed !== true) return json({ error: 'Túl sok próbálkozás. Kérlek, próbáld újra később.' }, 429);
  } catch (error) {
    console.error('Rate limit failure:', error instanceof Error ? error.name : 'unknown');
    return json({ error: 'A foglalás jelenleg nem elérhető.' }, 503);
  }

  let payload: unknown;
  try {
    payload = await readLimitedJson(req);
  } catch (error) {
    return json({ error: error instanceof Error && error.message === 'TOO_LARGE'
      ? 'Túl nagy kérés.' : 'Érvénytelen JSON.' },
      error instanceof Error && error.message === 'TOO_LARGE' ? 413 : 400);
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ error: 'Érvénytelen kérés.' }, 400);
  }
  const data = payload as Record<string, unknown>;
  const ids = data.product_ids;
  const guestName = data.guest_name;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 20 ||
      !ids.every((id) => typeof id === 'string' && uuidPattern.test(id)) ||
      new Set(ids).size !== ids.length) {
    return json({ error: '1–20 különböző, érvényes termékazonosító szükséges.' }, 400);
  }
  if (guestName !== undefined && guestName !== null &&
      (typeof guestName !== 'string' || guestName.length > 100)) {
    return json({ error: 'A név legfeljebb 100 karakter lehet.' }, 400);
  }

  const { data: rows, error } = await client.rpc('create_gift_reservation', {
    p_product_ids: ids,
    p_guest_name: typeof guestName === 'string' ? guestName.trim() || null : null,
  });
  if (error) {
    console.error('Reservation RPC failed:', error.code);
    return json({ error: 'A foglalás nem sikerült. Lehet, hogy az ajándék már foglalt.' }, 409);
  }
  const result = Array.isArray(rows) ? rows[0] : rows;
  if (!result) return json({ error: 'Nem érkezett foglalási visszaigazolás.' }, 500);
  return json({
    reservation_id: result.reservation_id,
    management_token: result.management_token,
    expires_at: result.expires_at,
  }, 201);
});
