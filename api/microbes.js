import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const microbeIds = await kv.lrange('microbe_ids', 0, -1) || [];
    if (microbeIds.length === 0) return res.json([]);
    
    const microbes = await kv.mget(...microbeIds.map(id => `microbe:${id}`));
    // Sort by date descending
    const sorted = microbes.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } 
  
  else if (req.method === 'POST') {
    const microbe = req.body;
    const id = microbe.id || Date.now().toString();
    microbe.id = id;
    
    // Check if we are updating by date
    const microbeIds = await kv.lrange('microbe_ids', 0, -1) || [];
    const allMicrobes = await kv.mget(...microbeIds.map(id => `microbe:${id}`));
    const existing = allMicrobes.find(m => m && m.date === microbe.date);
    
    if (existing) {
      // Update existing
      microbe.id = existing.id;
      microbe.likes = existing.likes || 0;
      await kv.set(`microbe:${existing.id}`, microbe);
      res.status(200).json(microbe);
    } else {
      // Create new
      microbe.likes = 0;
      await kv.set(`microbe:${id}`, microbe);
      await kv.lpush('microbe_ids', id);
      res.status(201).json(microbe);
    }
  } 
  
  else {
    res.status(405).end();
  }
}