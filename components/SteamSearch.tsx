import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GameList from "./GameList";
import { AxiosError } from "axios";
import Image from "next/image";

const SteamSearch: React.FC = () => {
  const [steamId, setSteamId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [data, setData] = useState<{
    personaname: string;
    avatarfull: string;
  } | null>(null);
  const [showGames, setShowGames] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedSteamId = localStorage.getItem("lastSteamId");
      const savedUsername = localStorage.getItem("lastUsername");
      const savedPersona = localStorage.getItem("lastPersonaName");
      const savedAvatar = localStorage.getItem("lastAvatarUrl");

      if (savedUsername) setUsername(savedUsername);
      if (savedSteamId && savedSteamId.length === 17) {
        setSteamId(savedSteamId);
        setShowGames(true);
      }
      if (savedPersona && savedAvatar) {
        setData({ personaname: savedPersona, avatarfull: savedAvatar });
      }
    } catch {
      // Ignore storage errors in restricted environments.
    }
  }, []);

  const handleSearchByUsername = async () => {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Please enter a username.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/steam/user?username=${encodeURIComponent(cleanUsername)}`);
      const result = await response.json();

      if (response.ok && result.steamId && result.success) {
        setSteamId(result.steamId);
        try {
          localStorage.setItem("lastSteamId", result.steamId);
          localStorage.setItem("lastUsername", cleanUsername);
        } catch {}
        setError(null);
        return;
      }

      setShowGames(false);
      setData(null);
      setError(result?.error || "No data found for the provided username.");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setError(`An error occurred: ${error.message}`);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!steamId || steamId.length !== 17) {
      setError("Please enter a valid 17-digit Steam ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/steam/user?steamId=${steamId}`);
      const result = await response.json();

      if (response.ok && result.response && result.response.players.length > 0) {
        const player = result.response.players[0];
        setData({
          personaname: player.personaname,
          avatarfull: player.avatarfull,
        });
        try {
          localStorage.setItem("lastSteamId", steamId);
          localStorage.setItem("lastPersonaName", player.personaname);
          localStorage.setItem("lastAvatarUrl", player.avatarfull);
        } catch {}
        setShowGames(true);
      } else {
        setData(null);
        setShowGames(false);
        setError(result?.error || "No data found for the provided Steam ID.");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setData(null);
        setShowGames(false);
        setError(`An error occurred while searching Steam data: ${error.message}`);
      } else {
        setData(null);
        setShowGames(false);
        setError("An unexpected error occurred while searching Steam data.");
      }
    } finally {
      setLoading(false);
    }
  }, [steamId]);

  useEffect(() => {
    if (steamId.length === 17) {
      handleSearch();
    }
  }, [steamId, handleSearch]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full rounded-xl border border-slate-300 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">By username</div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Enter Steam username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-grow bg-white dark:bg-slate-900"
          />
          <Button onClick={handleSearchByUsername} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      <div className="w-full rounded-xl border border-slate-300 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">By Steam ID</div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="7656119XXXXXXXXXX"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value.replace(/\D/g, "").slice(0, 17))}
            className="flex-grow bg-white dark:bg-slate-900"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={17}
            required
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-1 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <Image
            src={data.avatarfull}
            alt={`${data.personaname} avatar`}
            width={56}
            height={56}
            className="rounded-full"
          />
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Profile</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{data.personaname}</h3>
          </div>
        </div>
      )}

      {showGames && steamId && <GameList steamId={steamId} />}
    </div>
  );
};

export default SteamSearch;
