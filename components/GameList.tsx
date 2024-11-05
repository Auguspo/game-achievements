import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Game {
  appid: number;
  playtime_forever: number;
}

interface GameID {
  appid: number;
  name: string;
}

interface GamesID {
  applist: {
    apps: GameID[]; // Arreglo de juegos con appid y nombre
  };
}

const GameList: React.FC<{ steamId: string }> = ({ steamId }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [gamesID, setGamesID] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Estado para el término de búsqueda

  useEffect(() => {
    const fetchGames = async () => {
        try {
          const response = await axios.get(`/api/steamUser?steamId=${steamId}`);
          if (response.status !== 200) {
            throw new Error('Error al obtener juegos');
          }
          setGames(response.data.response.games);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      };
      

    const fetchGamesID = async () => {
      try {
        const response = await fetch('/GamesID.json'); // Ruta correcta al archivo en public
        if (!response.ok) {
          throw new Error('Error al cargar el archivo GamesID.json');
        }

        const gamesId: GamesID = await response.json();

        // Verificar que gamesId.applist.apps esté definido y sea un arreglo
        if (gamesId.applist && Array.isArray(gamesId.applist.apps)) {
          // Crear un mapa de appid a nombre de juego
          const gamesMap: { [key: number]: string } = {};
          gamesId.applist.apps.forEach((game) => {
            gamesMap[game.appid] = game.name || `Juego desconocido (appid: ${game.appid})`;
          });
          setGamesID(gamesMap);
        } else {
          throw new Error('Formato inesperado en GamesID.json');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los nombres de los juegos');
      }
    };

    fetchGames();
    fetchGamesID();
  }, [steamId]);

  // Filtrar juegos según el término de búsqueda
  const filteredGames = games.filter(game => {
    const gameName = gamesID[game.appid] || `Juego desconocido (appid: ${game.appid})`;
    return gameName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      {error && <p>Error: {error}</p>}
      <h2>Lista de Juegos:</h2>
      <input
        type="text"
        placeholder="Buscar juego..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Actualizar el término de búsqueda
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <ul>
        {filteredGames.map((game) => (
          <li key={game.appid}>
            {gamesID[game.appid] || `Juego desconocido (appid: ${game.appid})`} - Tiempo de juego: {game.playtime_forever} minutos
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameList;
