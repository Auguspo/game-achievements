// pages/api/gamesID.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'public', 'GamesID.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error al cargar el archivo GamesID.json' });
      return;
    }

    try {
      const gamesID = JSON.parse(data);
      res.status(200).json(gamesID);
    } catch (parseError) {
      res.status(500).json({ error: 'Error al analizar el archivo JSON' });
    }
  });
}
