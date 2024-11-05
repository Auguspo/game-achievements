import { NextResponse } from 'next/server';
import axios from 'axios';

const STEAM_API_KEY = '3608B8097FDD594B191A6845C5984509';

interface Achievement {
  name: string;
  apiname: string;
  achieved: number;
  unlocktime: number;
}

interface GlobalAchievement {
  name: string;
  percent: number;
}

// Manejador para el endpoint que recibe el appid y steamid y retorna todos los logros con `achieved`
export async function GET(request: Request, { params }: { params: { appid: string, steamid: string } }) {
  const { appid, steamid } = params;

  if (!appid || !steamid) {
    return NextResponse.json({ error: 'appid y steamid son requeridos' }, { status: 400 });
  }

  try {
    // Obtener los logros de un jugador
    const playerAchievementsResponse = await axios.get(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appid}&key=${STEAM_API_KEY}&steamid=${steamid}`);
    const playerAchievements = playerAchievementsResponse.data.playerstats.achievements as Achievement[];

    // Obtener el esquema de logros del juego
    const achievementsSchemaResponse = await axios.get(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${STEAM_API_KEY}&appid=${appid}&format=json`);
    const achievementsSchema = achievementsSchemaResponse.data.game.availableGameStats.achievements;

    // Obtener los porcentajes de logros globales
    const globalAchievementsResponse = await axios.get(`http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appid}&format=JSON`);
    const globalAchievements = globalAchievementsResponse.data.achievementpercentages.achievements as GlobalAchievement[];

    // Mapear y combinar la información de los logros
    const combinedAchievements = achievementsSchema.map((achievementSchema: any) => {
      const playerAchievement = playerAchievements.find((pa) => pa.apiname === achievementSchema.name);
      const globalAchievement = globalAchievements.find((ga) => ga.name === achievementSchema.name);

      return {
        ...achievementSchema,
        achieved: playerAchievement ? playerAchievement.achieved : 0,
        unlocktime: playerAchievement ? playerAchievement.unlocktime : 0,
        percent: globalAchievement ? globalAchievement.percent : 0, // Asigna 0 si no se encuentra el porcentaje
      };
    });

    // Ordenar los logros por el porcentaje de logro global de mayor a menor
    combinedAchievements.sort((a: { percent: number; }, b: { percent: number; }) => b.percent - a.percent);

    return NextResponse.json(combinedAchievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Error al obtener los logros' }, { status: 500 });
  }
}
