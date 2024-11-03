import axios from "axios";

// Función para obtener detalles del juego (logros)
export const fetchGameAchievements = async (gameId: number) => {
  try {
    let url = `https://api.rawg.io/api/games/${gameId}/achievements`;
    let allAchievements: any[] = [];

    while (url) {
      const response = await axios.get(url, {
        params: { key: process.env.RAWG_API_KEY },
      });

      // Combinar los resultados actuales con los acumulados
      allAchievements = allAchievements.concat(response.data.results);

      // Actualizar la URL a la siguiente página
      url = response.data.next;
    }

    return allAchievements; // Retornar todos los logros obtenidos
  } catch (error) {
    console.error("Error fetching game achievements", error);
    throw error; // Propagar el error para manejarlo donde se llame la función
  }
};

export const fetchGameDLCs = async (gameId: number) => {
  try {
    const response = await axios.get(
      `https://api.rawg.io/api/games/${gameId}/additions`,
      {
        params: { key: process.env.RAWG_API_KEY },
      }
    );

    return response.data.results; // Retornar los DLCs obtenidos
  } catch (error) {
    console.error("Error fetching game DLCs", error);
    throw error; // Propagar el error para manejarlo donde se llame la función
  }
};


export const fetchDLCsAndAchievements = async (gameId: number) => {
  try {
    const dlcs = await fetchGameDLCs(gameId);
    
    // Crear un arreglo de promesas para obtener logros de cada DLC
    const dlcAchievementsPromises = dlcs.map(async (dlc: { id: number; }) => {
      return {
        dlcId: dlc.id,
        achievements: await fetchGameAchievements(dlc.id),
      };
    });

    // Esperar a que todas las promesas de logros de los DLCs se resuelvan
    const dlcAchievements = await Promise.all(dlcAchievementsPromises);
    
    return dlcAchievements; // Retornar todos los logros de los DLCs
  } catch (error) {
    console.error("Error fetching DLCs and their achievements", error);
    throw error; // Propagar el error
  }
};

