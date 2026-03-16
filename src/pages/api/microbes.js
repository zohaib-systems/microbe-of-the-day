
    import { kv } from '@vercel/kv';

    export default async function handler(req, res) {
      if (req.method === 'POST') {
        const newMicrobe = req.body;
        // Use the date as a key for the microbe
        await kv.set(`microbe:${newMicrobe.date}`, newMicrobe);
        // We also store a list of all microbe dates to be able to retrieve them all
        const microbeDates = await kv.lrange('microbe_dates', 0, -1) || [];
        if (!microbeDates.includes(newMicrobe.date)) {
          await kv.lpush('microbe_dates', newMicrobe.date);
        }
        res.status(201).json(newMicrobe);
      } else if (req.method === 'GET') {
        const microbeDates = await kv.lrange('microbe_dates', 0, -1);
        if (!microbeDates || microbeDates.length === 0) {
          return res.status(200).json([]);
        }
        const microbes = await kv.mget(...microbeDates.map(date => `microbe:${date}`));
        res.status(200).json(microbes);
      } else {
        res.status(405).json({ message: 'Method Not Allowed' });
      }
    }
    