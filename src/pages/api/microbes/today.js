
    import { kv } from '@vercel/kv';

    export default async function handler(req, res) {
      const { date } = req.query;
      const microbe = await kv.get(`microbe:${date}`);

      if (microbe) {
        res.status(200).json(microbe);
      } else {
        res.status(404).json({ message: 'Microbe not found for this date' });
      }
    }
    