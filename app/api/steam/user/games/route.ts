// app/api/steam/user/games/route.ts
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_STEAM_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId");

  if (!steamId || typeof steamId !== "string") {
    return NextResponse.json(
      { error: "Se debe proporcionar un Steam ID válido." },
      { status: 400 },
    );
  }

  try {
    const response = await axios.get(
      `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json`,
    );

    if (
      response.status !== 200 ||
      !response.data.response ||
      !Array.isArray(response.data.response.games)
    ) {
      return NextResponse.json(
        { error: "Error al obtener los juegos del usuario." },
        { status: 500 },
      );
    }

    const gameIds = response.data.response.games.map((game: { appid: number; }) => game.appid);
    return NextResponse.json(gameIds, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los juegos del usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener los juegos del usuario." },
      { status: 500 },
    );
  }
}
