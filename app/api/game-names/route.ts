import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

let gameNameByIdCache: Map<number, string> | null = null;

const loadGameNameMap = (): Map<number, string> => {
  if (gameNameByIdCache) return gameNameByIdCache;

  const filePath = path.join(process.cwd(), 'GamesID.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  const gamesData = JSON.parse(data);

  if (!gamesData.applist || !Array.isArray(gamesData.applist.apps)) {
    throw new Error('The JSON file does not have the expected structure.');
  }

  gameNameByIdCache = new Map<number, string>(
    gamesData.applist.apps.map((app: { appid: number; name: string }) => [app.appid, app.name]),
  );

  return gameNameByIdCache;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameIds } = body;

    if (!Array.isArray(gameIds)) {
      return NextResponse.json({ error: 'The gameIds parameter must be an array.' }, { status: 400 });
    }

    const gameNameById = loadGameNameMap();

    const gamesList = gameIds.map((id: number) => {
      return { appid: id, name: gameNameById.get(id) || 'Unknown' };
    });

    return NextResponse.json(gamesList, { status: 200 });
  } catch (error) {
    console.error('Error fetching game names:', error);
    return NextResponse.json({ error: 'Error fetching game names.' }, { status: 500 });
  }
}
