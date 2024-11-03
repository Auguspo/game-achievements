import axios from 'axios';

interface SteamUser {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  realname?: string;
  loccountrycode?: string;
  // Agrega más campos según los necesites de la respuesta de la API
}

export const getUser = async (steamId: string): Promise<SteamUser> => {
  try {
    // Clave de la API obtenida de las variables de entorno
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      throw new Error('La clave de API de Steam no está definida en las variables de entorno.');
    }

    // URL de la solicitud usando el proxy
    const url = `/api/steam/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`;

    // Realiza la solicitud GET a la API de Steam
    const response = await axios.get(url);

    // Verifica si la respuesta contiene datos del jugador
    if (response.data.response && response.data.response.players.length > 0) {
      return response.data.response.players[0];
    } else {
      throw new Error('No se encontraron datos para el usuario especificado.');
    }
  } catch (error) {
    console.error('Error al obtener los datos del usuario de Steam:', error);
    throw error;
  }
};
