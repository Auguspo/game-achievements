import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

interface GlobalGameResult {
  appid: number;
  name: string;
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
  const [loadingGlobalSearch, setLoadingGlobalSearch] = useState<boolean>(false);
  const [globalSearchCompleted, setGlobalSearchCompleted] = useState<boolean>(false);
  const [globalSearchEnabled, setGlobalSearchEnabled] = useState<boolean>(false);
  const [globalMatches, setGlobalMatches] = useState<GlobalGameResult[]>([]);

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

        const namesResponse = await fetch("/api/game-names", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gameIds }),
        });
        if (!namesResponse.ok) {
          setError(`Error loading game names: ${namesResponse.status} ${namesResponse.statusText}`);
          setGamesID({});
          return;
        }

        const gameNamesData: GameID[] = await namesResponse.json();
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

  const fetchGlobalMatches = async (query: string) => {
    setLoadingGlobalSearch(true);
    setGlobalSearchCompleted(false);
    setError(null);

    try {
      const response = await fetch(
        `/api/game-search?query=${encodeURIComponent(query)}&limit=8`,
      );
      if (!response.ok) {
        throw new Error(`Error searching globally: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      setGlobalMatches(Array.isArray(result?.matches) ? result.matches : []);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Unknown error while searching globally");
      setGlobalMatches([]);
    } finally {
      setLoadingGlobalSearch(false);
      setGlobalSearchCompleted(true);
    }
  };

  const currentSearchQuery = searchTerm.trim();

  const handleGlobalSearch = async () => {
    if (!currentSearchQuery) return;
    setGlobalSearchEnabled(true);
    await fetchGlobalMatches(currentSearchQuery);
  };

  useEffect(() => {
    if (!globalSearchEnabled) return;
    if (!currentSearchQuery) {
      setGlobalMatches([]);
      setGlobalSearchCompleted(false);
      return;
    }
    fetchGlobalMatches(currentSearchQuery);
  }, [globalSearchEnabled, currentSearchQuery]);

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

      <div className="mb-3 space-y-2">
        <div className="flex justify-end">
          {!globalSearchEnabled ? (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Library search
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setGlobalSearchEnabled(false);
                setGlobalSearchCompleted(false);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Disable global search"
            >
              Global search
              <span className="text-xs leading-none">x</span>
            </button>
          )}
        </div>
        <Input
          type="text"
          placeholder="Search game..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white dark:bg-slate-950"
        />
      </div>

      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading games...</p>}

      {!loading && visibleGames.length > 0 && (
        <ul className="space-y-1">
          {displayGames.slice(0, 8).map((game) => (
            <li key={game.appid}>
              <Link
                href={`/${steamId}/game/${game.appid}`}
                className="block rounded-md border border-slate-200 px-3 py-2 text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800 dark:hover:text-blue-200"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{gamesID[game.appid] || `Unknown game (appid: ${game.appid})`}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Library match
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && !searchTerm && visibleGames.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Start typing to filter your games.</p>
      )}

      {!loading && searchTerm && filteredGames.length === 0 && !globalSearchEnabled && (
        <div className="w-full max-w-full space-y-3 overflow-hidden rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="break-words leading-relaxed">No games found in this library.</p>
          <p className="break-words leading-relaxed">
            If this title is shared through Family Sharing, Steam may not expose it in your owned games list.
          </p>
          <Button variant="outline" size="sm" onClick={handleGlobalSearch} disabled={loadingGlobalSearch}>
            {loadingGlobalSearch ? "Searching globally..." : "Search globally"}
          </Button>
        </div>
      )}

      {!loading && globalSearchEnabled && (
        <div className="w-full max-w-full space-y-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 break-words text-sm font-medium text-slate-700 dark:text-slate-200">
              {currentSearchQuery
                ? `Global matches for "${currentSearchQuery}"`
                : "Type to search globally."}
            </p>
          </div>

          {loadingGlobalSearch ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Searching globally...</p>
          ) : currentSearchQuery && globalMatches.length > 0 ? (
            <ul className="space-y-1">
              {globalMatches.map((game) => (
                <li key={game.appid}>
                  <Link
                    href={`/${steamId}/game/${game.appid}`}
                    className="block rounded-md border border-slate-200 bg-white px-3 py-2 text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 dark:border-slate-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800 dark:hover:text-blue-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{game.name}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Global match
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : currentSearchQuery && globalSearchCompleted ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No global matches found.</p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Start typing to search in the full catalog.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GameList;
