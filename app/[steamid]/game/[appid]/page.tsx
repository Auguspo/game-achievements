// app/[steamid]/game/[appid]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import GameView from "@/components/GameView"; // Asegúrate de que esta ruta sea correcta

export default function GamePage() {
  const params = useParams();
  const appid = params?.appid as string; // Obtener el appid de los parámetros
  const steamid = params?.steamid as string; // Obtener el steamid de los parámetros
  const [loading, setLoading] = useState(true);

  const [gameTitle, setGameTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]); // Estado para los logros

  useEffect(() => {
    const fetchGameData = async () => {
      if (!appid) return; // Asegúrate de que hay un appid
      console.log(steamid); // Imprimir el appid para verificar

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
        const achievementsData = responseac.data;

        // Filtrar logros que no han sido alcanzados (achieved = 0)
        const filteredAchievements = achievementsData.filter(
          (achievement: any) => achievement.achieved === 0,
        );

        setAchievements(filteredAchievements); // Guardar logros filtrados en el estado
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
    return <p>Error: {error}</p>;
  }

  if (loading || !gameTitle) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className='text-3xl font-bold mb-4'>Detalles del Juego</h1>
      <GameView
        appid={Number(appid)}
        gameTitle={gameTitle}
        achievements={achievements}
      />
    </div>
  );
}
