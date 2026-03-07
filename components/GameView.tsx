import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GameViewProps {
  appid: number;
  gameTitle: string;
  achievements: Achievement[];
  steamId: string;
  playtimeForever: number;
}

interface Achievement {
  name: string;
  defaultvalue: number;
  displayName: string;
  hidden: number;
  icon: string;
  icongray: string;
  description: string;
  achieved: number;
  unlocktime: number;
  percent: number;
}

interface SteamUser {
  personaName: string;
  avatarUrl: string;
}

const GameView: React.FC<GameViewProps> = ({ appid, gameTitle, achievements, steamId, playtimeForever }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const [gameImageIndex, setGameImageIndex] = useState<number>(0);

  const gameImageCandidates = useMemo(
    () => [
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_616x353.jpg`,
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/library_hero.jpg`,
    ],
    [appid],
  );

  const pendingAchievements = useMemo(
    () => achievements.filter((achievement) => achievement.achieved === 0),
    [achievements],
  );

  const progressPercent = useMemo(() => {
    const total = achievements.length;
    if (total === 0) return 0;
    const achieved = achievements.filter((achievement) => achievement.achieved === 1).length;
    return (achieved / total) * 100;
  }, [achievements]);

  const hasAchievements = achievements.length > 0;

  useEffect(() => {
    const fetchSteamUser = async () => {
      try {
        const response = await fetch(`/api/steam/user?steamId=${steamId}`);
        const data = await response.json();
        if (data.response?.players?.length > 0) {
          const player = data.response.players[0];
          setSteamUser({
            personaName: player.personaname,
            avatarUrl: player.avatarfull,
          });
        }
      } catch (error) {
        console.error("Error fetching Steam user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSteamUser();
  }, [steamId]);

  useEffect(() => {
    setGameImageIndex(0);
  }, [appid]);

  return (
    <Card className="mx-auto w-full max-w-2xl border-slate-300/80 bg-white/90 shadow-lg">
      <CardHeader className="space-y-3">
        <div>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {"<- Back to search"}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Game</p>
            <CardTitle className="text-2xl font-bold text-slate-900">{gameTitle}</CardTitle>
          </div>
          {steamUser && (
            <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5">
              <Image
                src={steamUser.avatarUrl}
                alt={`${steamUser.personaName} avatar`}
                width={26}
                height={26}
                className="rounded-full"
              />
              <span className="text-sm font-semibold text-slate-700">{steamUser.personaName}</span>
            </div>
          )}
        </div>

        <Image
          src={gameImageCandidates[gameImageIndex]}
          alt={`${gameTitle} header`}
          width={920}
          height={430}
          className="w-full rounded-lg border border-slate-300"
          priority
          onError={() => {
            setGameImageIndex((current) =>
              current < gameImageCandidates.length - 1 ? current + 1 : current,
            );
          }}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center text-sm text-slate-500">Loading game data...</div>
        ) : (
          <>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Completion</span>
                <span className="font-bold text-slate-900">{progressPercent.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2.5" />
              <p className="mt-2 text-xs text-slate-500">
                {hasAchievements
                  ? `Pending: ${pendingAchievements.length} / Total: ${achievements.length}`
                  : "This game has no achievements."}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Playtime: {(playtimeForever / 60).toFixed(1)} hours
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Pending Achievements</h3>

              {!hasAchievements && (
                <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  This game has no achievements.
                </p>
              )}

              {hasAchievements && pendingAchievements.length === 0 && (
                <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  You already completed all achievements in this game.
                </p>
              )}

              {hasAchievements && pendingAchievements.map((achievement) => {
                const gapPercent = Number(achievement.percent);
                const gapLabel = Number.isFinite(gapPercent) ? gapPercent.toFixed(1) : "0.0";
                return (
                <article
                  key={achievement.name}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  {achievement.icon && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      <Image
                        src={achievement.icon}
                        alt={achievement.displayName}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4
                      className="cursor-help truncate border-b border-dotted border-slate-400 pb-0.5 text-base font-semibold text-slate-900"
                      title={`Internal name: ${achievement.name}`}
                      aria-label={`Internal name: ${achievement.name}`}
                    >
                      {achievement.displayName}
                    </h4>
                    <p className="mt-1 text-sm text-slate-700">
                      {achievement.hidden ? "No description" : achievement.description || "No description"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      GAP: <span className="font-bold text-slate-900">{gapLabel}%</span>
                    </p>
                  </div>
                </article>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GameView;

