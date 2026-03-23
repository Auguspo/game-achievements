import { NextRequest, NextResponse } from 'next/server';

const steamApiKey = process.env.STEAM_API_KEY || process.env.NEXT_PUBLIC_STEAM_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get('steamId');
  const username = searchParams.get('username');

  if (!steamApiKey) {
    return NextResponse.json(
      { error: 'STEAM_API_KEY is not configured in the environment.' },
      { status: 500 },
    );
  }

  try {
    // Si se proporciona un `username`, primero resuelve el `steamId`
    if (username) {
      const resolveResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamApiKey}&vanityurl=${username}`,
      );
      const resolveData = await resolveResponse.json();

      if (resolveData.response.success !== 1) {
        return NextResponse.json(
          { error: 'Could not resolve username' },
          { status: 404 },
        );
      }

      // Autocompleta `steamId` con el resultado de la llamada
      const resolvedSteamId = resolveData.response.steamid;

      return NextResponse.json(
        {
          steamId: resolvedSteamId,
          success: true,
        },
        { status: 200 },
      );
    }

    // Si se proporciona un `steamId`, realiza la llamada para obtener los datos del jugador
    if (steamId) {
      const response = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`,
      );
      const responseData = await response.json();

      return NextResponse.json(responseData, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Steam ID or username is required' },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error('Error at API call:', error);
    return NextResponse.json({ error: 'Unknown API error' }, { status: 500 });
  }
}
