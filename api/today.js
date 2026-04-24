import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const microbeIds = await kv.lrange('microbe_ids', 0, -1) || [];
  
  if (microbeIds.length === 0) return res.json(null);
  
  const allMicrobes = (await kv.mget(...microbeIds.map(id => `microbe:${id}`))).filter(Boolean);
  const microbe = allMicrobes.find(m => m.date === date);
  
  if (microbe) {
    res.json(microbe);
  } else {
    // Fallback to most recent
    const sorted = allMicrobes.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted[0] || null);
  }
}
