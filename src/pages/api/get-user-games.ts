// pages/api/get-user-games.ts
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { steamId } = req.query;

  const apiKey = process.env.STEAM_API_KEY; // Asegúrate de tener tu clave API configurada en .env
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json`;

  try {
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al obtener juegos de Steam:', error);
    res.status(500).json({ message: 'Error al obtener juegos de Steam.' });
  }
}
