import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GameViewProps {
  appid: number;
  gameTitle: string;
  achievements: Achievement[];
  steamId: string; // Añadimos steamId como prop
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

const GameView: React.FC<GameViewProps> = ({
  appid,
  gameTitle,
  achievements,
  steamId, // Recibimos steamId como prop
}) => {
  const [achievementsFiltered, setAchievementsFiltered] = useState<Achievement[]>([]);
  const [percentage, setPercentage] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null); // Estado para almacenar la información del usuario

  useEffect(() => {
    const filteredAchievements = achievements.filter(
      (achievement) => achievement.achieved === 0
    );
    setAchievementsFiltered(filteredAchievements);

    const calculateAchievementPercentage = (achievements: Achievement[]) => {
      const totalAchievements = achievements.length;
      const achievedCount = achievements.filter((ach) => ach.achieved === 1).length;

      if (totalAchievements === 0) return 0; 

      return (achievedCount / totalAchievements) * 100;
    };

    setPercentage(calculateAchievementPercentage(achievements));

    // Obtener la información del usuario de Steam
    const fetchSteamUser = async () => {
      try {
        const response = await fetch(`/api/steam/user?steamId=${steamId}`);
        const data = await response.json();
        if (data.response.players && data.response.players.length > 0) {
          const player = data.response.players[0];
          setSteamUser({
            personaName: player.personaname,
            avatarUrl: player.avatarfull,
          });
        }
      } catch (error) {
        console.error("Error fetching Steam user data:", error);
      }
    };

    fetchSteamUser();

    // Cambiar el estado de carga a false una vez que todo esté calculado
    setLoading(false);
  }, [achievements, steamId]);

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-100">
      <CardHeader className="relative">
        {/* Avatar y nombre en las esquinas */}
        <div className="absolute left-2 top-2 flex items-center space-x-2">
          {steamUser && (
            <>
              <Image
                src={steamUser.avatarUrl}
                alt={`${steamUser.personaName}'s avatar`}
                width={30}
                height={30}
                className="rounded-full"
              />
              <span className="text-sm font-semibold">{steamUser.personaName}</span>
            </>
          )}
        </div>
        {/* Título del juego en el centro */}
        <div className="flex justify-center">
          <CardTitle className="text-center text-2xl font-bold">{gameTitle}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Image
          src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg?t=1722458438`}
          alt={`${gameTitle} Header`}
          width={600}
          height={200}
          className="mt-2 w-full h-auto rounded"
          priority={true}
        />
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Progress value={percentage} className="flex-1 mr-4" />
              <span className="font-semibold">{percentage?.toFixed(0)}%</span>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold mb-2">Achievements:</h3>
              {achievementsFiltered.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 my-1 p-2 border border-gray-300 rounded-lg bg-gray-50"
                >
                  {achievement.icon && (
                    <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center my-auto">
                      <Image
                        src={achievement.icon}
                        alt={achievement.displayName}
                        layout="fill"
                        objectFit="contain"
                        className="rounded"
                      />
                    </div>
                  )}
                  <div className="flex-grow overflow-hidden whitespace-normal break-words">
                    <h4 className="font-semibold">
                      {achievement.name}: {achievement.displayName}
                    </h4>
                    <p>
                      {achievement.hidden
                        ? "No description"
                        : achievement.description || "No description"}
                    </p>
                    <p>  GAP: {typeof achievement.percent === 'number'
    ? achievement.percent.toFixed(1)
    : 'N/A'}
  %</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GameView;
