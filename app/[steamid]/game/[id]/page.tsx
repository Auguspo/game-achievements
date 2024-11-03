'use client'

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AchievementGame from '@/components/achievement-game';
import axios from 'axios';

export default function GamePage() {
  const params = useParams();
  const id = params?.appid as string; // Obtener el appid de los parámetros
  const steamid = params?.steamid as string; // Obtener el steamid de los parámetros

  const [gameTitle, setGameTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!id) return; // Asegúrate de que hay un id

      console.log(steamid); // Imprimir el id para verificar

      try {
        const response = await axios.post('/api/get-game-names', {
          gameIds: [parseInt(id)], // Usa el id para la búsqueda
        });

        console.log(response.data); // Asegúrate de que estás recibiendo los datos correctos

        // Verifica que la respuesta es exitosa y que hay datos
        if (response.status === 200 && response.data.length > 0) {
          const game = response.data[0]; // Asumir que el primer objeto es el juego que buscas
          setGameTitle(game.name); // Asigna el nombre del juego al estado
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };

    fetchGameData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {gameTitle && (
        <AchievementGame
          gameTitle={gameTitle}
          id={id} // Asegúrate de pasar el id correctamente
        />
      )}
    </div>
  );
}
