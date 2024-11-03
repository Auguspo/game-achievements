import axios from 'axios';

/**
 * Obtiene una lista de los appid de los juegos de un usuario de Steam.
 * @param steamId - El ID de Steam del usuario.
 * @returns - Una lista de appid de los juegos del usuario.
 */
export const getUserGames = async (steamId: string): Promise<number[]> => {
  try {
    const response = await axios.get(`/api/get-user-games?steamId=${steamId}`);
    if (response.data.response && response.data.response.games) {
      return response.data.response.games.map((game: { appid: number }) => game.appid);
    } else {
      console.warn('No se encontraron juegos para el usuario especificado.');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener los juegos del usuario de Steam:', error);
    throw error;
  }
};

