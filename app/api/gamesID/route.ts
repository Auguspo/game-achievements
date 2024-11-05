// app/api/gamesID/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'GamesID.json');

  return new Promise((resolve) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return resolve(NextResponse.json({ error: 'Error al cargar el archivo GamesID.json' }, { status: 500 }));
      }

      try {
        const gamesID = JSON.parse(data);
        return resolve(NextResponse.json(gamesID));
      } catch (parseError) {
        return resolve(NextResponse.json({ error: 'Error al analizar el archivo JSON' }, { status: 500 }));
      }
    });
  });
}
