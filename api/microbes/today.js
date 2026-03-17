
    import { kv } from '@vercel/kv';

    export default async function handler(req, res) {
      const { date } = req.query;
      const microbe = await kv.get(`microbe:${date}`);
      res.status(200).json(microbe);
    }
    