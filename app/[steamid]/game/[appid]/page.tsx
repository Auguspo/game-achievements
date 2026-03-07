// app/[steamid]/game/[appid]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
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

interface ApiErrorResponse {
  error?: string;
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
        const response = await axios.post("/api/game-names", {
          gameIds: [parsedAppId],
        });

        if (response.status === 200 && response.data.length > 0) {
          const game = response.data[0];
          setGameTitle(game.name || `Unknown game (appid: ${parsedAppId})`);
        } else {
          setError("Game title could not be loaded.");
          return;
        }

        const responseac = await axios.get(
          `/api/get-user-achievements/${appid}/${steamid}`,
        );
        const achievementsData: CombinedAchievement[] = responseac.data;
        setAchievements(Array.isArray(achievementsData) ? achievementsData : []);

        const ownedGamesResponse = await axios.get(
          `/api/steam/user/games?steamId=${steamid}`,
        );
        const ownedGames: OwnedGame[] = ownedGamesResponse.data;
        const currentGame = ownedGames.find((game) => game.appid === parsedAppId);
        setPlaytimeForever(currentGame?.playtime_forever ?? 0);
      } catch (requestError) {
        console.error("Error fetching game data:", requestError);
        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(requestError.response?.data?.error || "Error loading game data.");
        } else {
          setError("Error loading game data.");
        }
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
      />
    </>
  );
}
