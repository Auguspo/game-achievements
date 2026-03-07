import { NextResponse } from 'next/server';
import axios from 'axios';

const steamApiKey = process.env.STEAM_API_KEY || process.env.NEXT_PUBLIC_STEAM_KEY;

interface Achievement {
  name: string;
  apiname: string;
  achieved: number;
  unlocktime: number;
}

interface AchievementSchema {
  name: string;
  defaultvalue: number;
  displayName: string;
  hidden: number;
  description: string;
  icon: string;
  icongray: string;
}

interface GlobalAchievement {
  name: string;
  percent: number;
}

type CombinedAchievement = Achievement & AchievementSchema & GlobalAchievement;

// Manejador para el endpoint que recibe el appid y steamid y retorna todos los logros con `achieved`
export async function GET(
  request: Request,
  { params }: { params: Promise<{ appid: string; steamid: string }> },
) {
  const { appid, steamid } = await params;

  if (!steamApiKey) {
    return NextResponse.json(
      { error: 'STEAM_API_KEY is not configured in the environment.' },
      { status: 500 },
    );
  }

  if (!appid || !steamid) {
    return NextResponse.json(
      { error: 'appid and steamid are required' },
      { status: 400 },
    );
  }

  try {
    // Obtener el esquema de logros del juego
    const achievementsSchemaResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${steamApiKey}&appid=${appid}&format=json`,
    );
    const achievementsSchema = achievementsSchemaResponse.data?.game?.availableGameStats
      ?.achievements as AchievementSchema[] | undefined;

    if (!Array.isArray(achievementsSchema) || achievementsSchema.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Obtener los logros de un jugador.
    // Steam puede devolver 400 para algunos casos validos (p. ej. juegos sin stats por usuario).
    const playerAchievementsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appid}&key=${steamApiKey}&steamid=${steamid}`,
      { validateStatus: () => true },
    );
    const playerStats = playerAchievementsResponse.data?.playerstats;
    const playerStatsError = String(playerStats?.error ?? "").toLowerCase();

    if (playerStatsError.includes("private")) {
      return NextResponse.json(
        { error: "Achievements cannot be fetched because this Steam profile is private." },
        { status: 403 },
      );
    }

    if (playerAchievementsResponse.status === 400) {
      return NextResponse.json([], { status: 200 });
    }

    if (playerAchievementsResponse.status >= 500) {
      return NextResponse.json({ error: 'Error fetching achievements' }, { status: 500 });
    }

    const playerAchievements = Array.isArray(playerStats?.achievements)
      ? (playerStats.achievements as Achievement[])
      : [];

    // Obtener los porcentajes de logros globales
    const globalAchievementsResponse = await axios.get(
      `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appid}&format=JSON`,
    );
    const globalAchievements = Array.isArray(
      globalAchievementsResponse.data?.achievementpercentages?.achievements,
    )
      ? (globalAchievementsResponse.data.achievementpercentages.achievements as GlobalAchievement[])
      : [];

    // Mapear y combinar la informacion de los logros
    const combinedAchievements: CombinedAchievement[] = achievementsSchema.map(
      (achievementSchema) => {
        const playerAchievement = playerAchievements.find(
          (pa) => pa.apiname === achievementSchema.name,
        );
        const globalAchievement = globalAchievements.find(
          (ga) => ga.name === achievementSchema.name,
        );

        return {
          ...achievementSchema,
          achieved: playerAchievement ? playerAchievement.achieved : 0,
          unlocktime: playerAchievement ? playerAchievement.unlocktime : 0,
          // Asigna 0 si no se encuentra el porcentaje
          percent: globalAchievement ? Number(globalAchievement.percent) : 0,
        } as CombinedAchievement;
      },
    );

    // Ordenar los logros por el porcentaje de logro global de mayor a menor
    combinedAchievements.sort((a: { percent: number }, b: { percent: number }) => b.percent - a.percent);

    return NextResponse.json(combinedAchievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Error fetching achievements' }, { status: 500 });
  }
}
