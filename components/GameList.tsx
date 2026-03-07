import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface Game {
  appid: number;
  playtime_forever: number;
  rtime_last_played?: number;
}

interface GameID {
  appid: number;
  name: string;
}

interface GamesErrorResponse {
  error?: string;
}

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const GameList: React.FC<{ steamId: string }> = ({ steamId }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [gamesID, setGamesID] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchGames = async () => {
      setError(null);
      setLoading(true);

      try {
        const response = await fetch(`/api/steam/user/games?steamId=${steamId}`);
        if (!response.ok) {
          let message = `Error fetching games: ${response.status} ${response.statusText}`;
          try {
            const errorData: GamesErrorResponse = await response.json();
            if (errorData?.error) {
              message = errorData.error;
            }
          } catch {
            // keep default status message if no JSON body
          }
          setError(message);
          setGames([]);
          setGamesID({});
          return;
        }

        const ownedGames: Game[] = await response.json();
        setGames(ownedGames);
        const gameIds = ownedGames.map((game) => game.appid);

        const namesResponse = await axios.post("/api/game-names", { gameIds });
        if (namesResponse.status !== 200) {
          setError(`Error loading game names: ${namesResponse.status} ${namesResponse.statusText}`);
          setGamesID({});
          return;
        }

        const gameNamesData: GameID[] = namesResponse.data;
        const gamesMap: { [key: number]: string } = {};
        gameNamesData.forEach((game) => {
          gamesMap[game.appid] = game.name || `Unknown game (appid: ${game.appid})`;
        });
        setGamesID(gamesMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error while loading games");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [steamId]);

  const filteredGames = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm.trim());
    return games.filter((game) => {
      const gameName = gamesID[game.appid] || `Unknown game (appid: ${game.appid})`;
      return normalizeText(gameName).includes(normalizedSearchTerm);
    });
  }, [games, gamesID, searchTerm]);

  const visibleGames = useMemo(
    () => (searchTerm.trim() ? filteredGames : games),
    [filteredGames, games, searchTerm],
  );

  const displayGames = useMemo(
    () =>
      [...visibleGames].sort(
        (a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0),
      ),
    [visibleGames],
  );

  return (
    <div className="w-full rounded-xl border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {error && (
        <p className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Game list</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Type to find a game and open its achievements.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {games.length} games
        </span>
      </div>

      <Input
        type="text"
        placeholder="Search game..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3 bg-white dark:bg-slate-950"
      />

      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading games...</p>}

      {!loading && visibleGames.length > 0 && (
        <ul className="space-y-1">
          {displayGames.slice(0, 8).map((game) => (
            <li key={game.appid}>
              <Link
                href={`/${steamId}/game/${game.appid}`}
                className="block rounded-md border border-slate-200 px-3 py-2 text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800 dark:hover:text-blue-200"
              >
                <p className="font-medium">{gamesID[game.appid] || `Unknown game (appid: ${game.appid})`}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && !searchTerm && visibleGames.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Start typing to filter your games.</p>
      )}

      {!loading && searchTerm && filteredGames.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No games found.</p>
      )}
    </div>
  );
};

export default GameList;
