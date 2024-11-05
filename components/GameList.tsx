import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Game {
  appid: number;
  playtime_forever: number;
}

interface GameID {
  appid: number;
  name: string;
}

const GameList: React.FC<{ steamId: string }> = ({ steamId }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [gamesID, setGamesID] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`/api/steam/user/games?steamId=${steamId}`);
        if (response.ok) {
          const gameIds: number[] = await response.json();
          setGames(gameIds.map((id) => ({ appid: id, playtime_forever: 0 })));
          await fetchGamesID(gameIds);
        } else {
          setError(`Error al obtener los juegos: ${response.status} - ${response.statusText}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al obtener los juegos');
      }
    };

    const fetchGamesID = async (gameIds: number[]) => {
      try {
        const response = await axios.post('/api/game-names', { gameIds });
        if (response.status === 200) {
          const gamesData: GameID[] = response.data;
          const gamesMap: { [key: number]: string } = {};
          gamesData.forEach((game) => {
            gamesMap[game.appid] = game.name || `Juego desconocido (appid: ${game.appid})`;
          });
          setGamesID(gamesMap);
        } else {
          setError(`Error al cargar los nombres de los juegos: ${response.status} - ${response.statusText}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar los nombres de los juegos');
      }
    };

    fetchGames();
  }, [steamId]);

  const filteredGames = games.filter((game) => {
    const gameName = gamesID[game.appid] || `Juego desconocido (appid: ${game.appid})`;
    return gameName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-lg w-full p-4">
      {error && <p className="text-red-500">{error}</p>}
      <h2 className="text-2xl font-bold mb-4 text-center">Game list:</h2>
      <input
        type="text"
        placeholder="Search game..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 box-border"
      />
      {/* Renderizar la lista solo si el input no está vacío */}
      {searchTerm && filteredGames.length > 0 && (
        <ul className="space-y-2">
          {filteredGames.map((game) => (
            <li key={game.appid} className="border-b border-gray-300 pb-2">
              <Link
                href={`/${steamId}/game/${game.appid}`}
                className="text-blue-600 hover:text-blue-800 hover:underline transition duration-200 ease-in-out cursor-pointer"
              >
                {gamesID[game.appid] || `Juego desconocido (appid: ${game.appid})`}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {/* Mensaje si no hay juegos que coincidan con la búsqueda */}
      {searchTerm && filteredGames.length === 0 && (
        <p className="text-gray-500">No games found</p>
      )}
    </div>
  );
};

export default GameList;
