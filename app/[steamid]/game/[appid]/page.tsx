// app/[steamid]/game/[appid]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GameView from "@/components/GameView";

interface CombinedAchievement {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  icongray: string;
  defaultvalue: number;
  hidden: number;
  achieved: number;
  unlocktime: number;
  percent: number;
}

interface OwnedGame {
  appid: number;
  playtime_forever: number;
}

export default function GamePage() {
  const params = useParams();
  const appid = params?.appid as string;
  const steamid = params?.steamid as string;
  const [loading, setLoading] = useState(true);

  const [gameTitle, setGameTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<CombinedAchievement[]>([]);
  const [playtimeForever, setPlaytimeForever] = useState<number>(0);
  const [isFromLibrary, setIsFromLibrary] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (steamid) {
        localStorage.setItem("lastSteamId", steamid);
      }
    } catch {}
  }, [steamid]);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!appid) return;
      const parsedAppId = Number(appid);
      if (!Number.isInteger(parsedAppId)) {
        setError("Invalid game id.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/game-names", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gameIds: [parsedAppId] }),
        });
        const gameNameResponse = await response.json();

        if (response.ok && Array.isArray(gameNameResponse) && gameNameResponse.length > 0) {
          const game = gameNameResponse[0];
          setGameTitle(game.name || `Unknown game (appid: ${parsedAppId})`);
        } else {
          setError("Game title could not be loaded.");
          return;
        }

        const responseac = await fetch(
          `/api/get-user-achievements/${appid}/${steamid}`,
        );
        if (!responseac.ok) {
          const errorData = await responseac.json().catch(() => ({}));
          setError(errorData?.error || "Error loading game data.");
          return;
        }
        const achievementsData: CombinedAchievement[] = await responseac.json();
        setAchievements(Array.isArray(achievementsData) ? achievementsData : []);

        const ownedGamesResponse = await fetch(
          `/api/steam/user/games?steamId=${steamid}`,
        );
        if (!ownedGamesResponse.ok) {
          const errorData = await ownedGamesResponse.json().catch(() => ({}));
          setError(errorData?.error || "Error loading game data.");
          return;
        }
        const ownedGames: OwnedGame[] = await ownedGamesResponse.json();
        const currentGame = ownedGames.find((game) => game.appid === parsedAppId);
        setIsFromLibrary(Boolean(currentGame));
        setPlaytimeForever(currentGame?.playtime_forever ?? 0);
      } catch (requestError) {
        console.error("Error fetching game data:", requestError);
        setError(requestError instanceof Error ? requestError.message : "Error loading game data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [appid, steamid]);

  if (error) {
    return <p className="text-center">Error: {error}</p>;
  }

  if (loading || !gameTitle) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <GameView
        steamId={steamid}
        appid={Number(appid)}
        gameTitle={gameTitle}
        achievements={achievements}
        playtimeForever={playtimeForever}
        isFromLibrary={isFromLibrary}
      />
    </>
  );
}
