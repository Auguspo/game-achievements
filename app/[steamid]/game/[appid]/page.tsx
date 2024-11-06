// app/[steamid]/game/[appid]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import GameView from "@/components/GameView"; // Asegúrate de que esta ruta sea correcta

interface CombinedAchievement {
  name: string; // Apiname
  displayName: string;
  description: string;
  icon: string;
  icongray: string;
  defaultvalue: number;
  hidden: number;
  achieved: number;
  unlocktime: number;
  percent: number; // Porcentaje de logro global
}

export default function GamePage() {
  const params = useParams();
  const appid = params?.appid as string; // Obtener el appid de los parámetros
  const steamid = params?.steamid as string; // Obtener el steamid de los parámetros
  const [loading, setLoading] = useState(true);

  const [gameTitle, setGameTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<CombinedAchievement[]>([]); // Estado para los logros

  useEffect(() => {
    const fetchGameData = async () => {
      if (!appid) return; // Asegúrate de que hay un appid

      try {
        // Obtener el nombre del juego
        const response = await axios.post("/api/game-names", {
          gameIds: [parseInt(appid)], // Usa el appid para la búsqueda
        });

        console.log(response.data); // Asegúrate de que estás recibiendo los datos correctos

        // Verifica que la respuesta es exitosa y que hay datos
        if (response.status === 200 && response.data.length > 0) {
          const game = response.data[0]; // Asumir que el primer objeto es el juego que buscas
          setGameTitle(game.name); // Asigna el nombre del juego al estado
        }

        // Obtener los logros
        const responseac = await axios.get(
          `/api/get-user-achievements/${appid}/${steamid}`,
        );

        console.log(responseac);
        setAchievements(responseac.data); // Guardar logros filtrados en el estado
      } catch (error) {
        console.error("Error fetching game data:", error);
        setError("Error al cargar los datos del juego.");
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };

    fetchGameData();
  }, [appid, steamid]);

  if (error) {
    return <p className='text-center'>Error: {error}</p>;
  }

  if (loading || !gameTitle) {
    return <div className='text-center'>Loading...</div>; // Mensaje de carga
  }

  return (
    <>
      <GameView
      steamId={steamid}
        appid={Number(appid)}
        gameTitle={gameTitle}
        achievements={achievements}
      />
    </>
  );
}
