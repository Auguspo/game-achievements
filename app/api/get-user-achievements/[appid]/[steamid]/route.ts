import { NextResponse } from 'next/server';

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
    // Obtener los logros de un jugador.
    // Steam puede devolver 400 para algunos casos validos (p. ej. juegos sin stats por usuario).
    const playerAchievementsResponse = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appid}&key=${steamApiKey}&steamid=${steamid}`,
    );
    const playerAchievementsData = await playerAchievementsResponse.json();
    const playerStats = playerAchievementsData?.playerstats;
    const playerStatsError = String(playerStats?.error ?? "").toLowerCase();

    if (playerStatsError.includes("private")) {
      return NextResponse.json(
        { error: "Achievements cannot be fetched because this Steam profile is private." },
        { status: 403 },
      );
    }

    // If Steam does not return per-user stats (e.g. brand-new profile for this game),
    // keep going with an empty user-achievements list so schema achievements still render.
    const playerAchievements = playerAchievementsResponse.status === 200 &&
      Array.isArray(playerStats?.achievements)
      ? (playerStats.achievements as Achievement[])
      : [];

    // Obtener el esquema de logros del juego
    const achievementsSchemaResponse = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${steamApiKey}&appid=${appid}&format=json`,
    );
    const achievementsSchemaData = await achievementsSchemaResponse.json();
    const achievementsSchema = achievementsSchemaData?.game?.availableGameStats
      ?.achievements as AchievementSchema[] | undefined;

    // Obtener los porcentajes de logros globales
    const globalAchievementsResponse = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appid}&format=JSON`,
    );
    const globalAchievementsData = await globalAchievementsResponse.json();
    const globalAchievements = Array.isArray(
      globalAchievementsData?.achievementpercentages?.achievements,
    )
      ? (globalAchievementsData.achievementpercentages.achievements as GlobalAchievement[])
      : [];

    // Fallback: si el schema no llega pero hay logros globales, construir una lista util
    // para mostrar achievements pendientes con nombre base.
    const schemaOrFallback: AchievementSchema[] = Array.isArray(achievementsSchema) && achievementsSchema.length > 0
      ? achievementsSchema
      : globalAchievements.map((achievement) => ({
        name: achievement.name,
        defaultvalue: 0,
        displayName: achievement.name,
        hidden: 0,
        description: "",
        icon: "",
        icongray: "",
      }));

    if (schemaOrFallback.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Mapear y combinar la informacion de los logros
    const combinedAchievements: CombinedAchievement[] = schemaOrFallback.map(
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
