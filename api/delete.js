import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing ID' });
  
  await kv.del(`microbe:${id}`);
  await kv.lrem('microbe_ids', 0, id);
  
  res.json({ success: true });
}
