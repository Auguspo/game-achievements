// app/api/gamesID/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'GamesID.json');

  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const gamesID = JSON.parse(data);
    return NextResponse.json(gamesID); // Respondemos con el JSON
  } catch (err) {
    console.error('Error reading or parsing GamesID.json', err);
    return NextResponse.json({ error: 'Error al cargar el archivo GamesID.json' }, { status: 500 });
  }
}
