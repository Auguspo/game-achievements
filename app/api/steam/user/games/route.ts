// app/api/steam/user/games/route.ts
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const steamApiKey = process.env.STEAM_API_KEY || process.env.NEXT_PUBLIC_STEAM_KEY;
type SteamOwnedGame = {
  appid: number;
  playtime_forever: number;
  rtime_last_played?: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get('steamId');

  if (!steamApiKey) {
    return NextResponse.json(
      { error: 'STEAM_API_KEY is not configured in the environment.' },
      { status: 500 },
    );
  }

  if (!steamId || typeof steamId !== 'string') {
    return NextResponse.json(
      { error: 'A valid Steam ID must be provided.' },
      { status: 400 },
    );
  }

  try {
    const response = await axios.get(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&include_played_free_games=1&format=json`,
    );

    if (response.status !== 200 || !response.data.response) {
      return NextResponse.json(
        { error: 'Error fetching user games.' },
        { status: 500 },
      );
    }

    if (!Array.isArray(response.data.response.games)) {
      return NextResponse.json(
        { error: 'Games cannot be fetched because the Steam profile or game library is private.' },
        { status: 403 },
      );
    }

    const games: SteamOwnedGame[] = response.data.response.games.map((game: SteamOwnedGame) => ({
      appid: game.appid,
      playtime_forever: game.playtime_forever ?? 0,
      rtime_last_played: game.rtime_last_played ?? 0,
    }));

    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error('Error fetching user games:', error);
    return NextResponse.json(
      { error: 'Error fetching user games.' },
      { status: 500 },
    );
  }
}
