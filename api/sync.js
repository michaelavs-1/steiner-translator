import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    if (req.method === 'GET') {
      const id = (req.query && req.query.id) || '';
      if (!id || id.length < 16 || id.length > 256) { res.status(400).json({ error: 'bad id' }); return; }
      const val = await kv.get('steiner:' + id);
      if (!val) { res.status(404).json({ error: 'not found' }); return; }
      res.status(200).json({ blob: val });
      return;
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, blob } = body || {};
      if (!id || id.length < 16 || id.length > 256) { res.status(400).json({ error: 'bad id' }); return; }
      if (!blob || typeof blob !== 'string' || blob.length > 20000) { res.status(400).json({ error: 'bad blob' }); return; }
      await kv.set('steiner:' + id, blob);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
