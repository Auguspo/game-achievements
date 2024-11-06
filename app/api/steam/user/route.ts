import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

const apiKey = process.env.NEXT_PUBLIC_STEAM_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get('steamId');
  const username = searchParams.get('username');

  try {
    // Si se proporciona un `username`, primero resuelve el `steamId`
    if (username) {
      const resolveResponse = await axios.get(
        `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${username}`
      );
      const resolveData = resolveResponse.data;

      if (resolveData.response.success !== 1) {
        return NextResponse.json(
          { error: 'No se pudo resolver el nombre de usuario' },
          { status: 404 }
        );
      }

      // Autocompleta `steamId` con el resultado de la llamada
      const resolvedSteamId = resolveData.response.steamid;

    
      return NextResponse.json(
        { steamId: resolvedSteamId,
          success: true,
        },
        { status: 200 }
      );
    }

    // Si se proporciona un `steamId`, realiza la llamada para obtener los datos del jugador
    if (steamId) {
      const response = await axios.get(
        `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
      );

      return NextResponse.json(response.data, { status: 200 });
    }

    return NextResponse.json({ error: 'Se requiere un Steam ID o username' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Error at API call:', error);
    if (error instanceof AxiosError) {
      if (error.response) {
        console.error('API Response:', error.response.data);
        return NextResponse.json(
          { error: `API Error: ${error.response.data.error}` },
          { status: error.response.status }
        );
      }
    }
    return NextResponse.json({ error: 'Unknown API error' }, { status: 500 });
  }
}
