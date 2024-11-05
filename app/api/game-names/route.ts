import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameIds } = body;

    if (!Array.isArray(gameIds)) {
      return NextResponse.json({ error: 'El parámetro gameIds debe ser un array.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'GamesID.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const gamesData = JSON.parse(data);

    if (!gamesData.applist || !Array.isArray(gamesData.applist.apps)) {
      throw new Error('El archivo JSON no tiene la estructura esperada.');
    }

    const gamesList = gameIds.map((id: number) => {
      const game = gamesData.applist.apps.find((app: { appid: number; name: string }) => app.appid === id);
      return game ? { appid: id, name: game.name } : { appid: id, name: 'Desconocido' };
    });

    return NextResponse.json(gamesList, { status: 200 });
  } catch (error) {
    console.error('Error al obtener los nombres de los juegos:', error);
    return NextResponse.json({ error: 'Error al obtener los nombres de los juegos.' }, { status: 500 });
  }
}
