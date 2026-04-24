import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing ID' });
  
  const microbe = await kv.get(`microbe:${id}`);
  if (!microbe) return res.status(404).json({ error: 'Not found' });
  
  microbe.likes = (microbe.likes || 0) + 1;
  await kv.set(`microbe:${id}`, microbe);
  res.json(microbe);
}
