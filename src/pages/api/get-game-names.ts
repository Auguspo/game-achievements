// pages/api/get-game-names.ts
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Manejador de la API para obtener los nombres de los juegos basados en una lista de IDs.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { gameIds } = req.body;

    if (!Array.isArray(gameIds)) {
      return res.status(400).json({ error: 'El parámetro gameIds debe ser un array.' });
    }

    try {
      // Ruta al archivo GamesID.json
      const filePath = path.join(process.cwd(), 'GamesID.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      const gamesData = JSON.parse(data);

      // Verifica que la estructura del JSON sea válida
      if (!gamesData.applist || !Array.isArray(gamesData.applist.apps)) {
        throw new Error('El archivo JSON no tiene la estructura esperada.');
      }

      // Busca los juegos correspondientes a las IDs proporcionadas
      const gamesList = gameIds.map((id: number) => {
        const game = gamesData.applist.apps.find((app: { appid: number; name: string }) => app.appid === id);
        return game ? { appid: id, name: game.name } : { appid: id, name: 'Desconocido' };
      });

      res.status(200).json(gamesList);
    } catch (error) {
      console.error('Error al obtener los nombres de los juegos:', error);
      res.status(500).json({ error: 'Error al obtener los nombres de los juegos.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
