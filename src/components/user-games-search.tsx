"use client";
import axios from 'axios';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getUser } from "@/lib/get-user"; // Asegúrate de que la ruta sea la correcta
import { getUserGames } from "@/lib/get-user-games";

interface SteamUser {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  realname?: string;
  loccountrycode?: string;
}

export default function UserSeachGame() {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState<SteamUser | null>(null);
  const [gameQuery, setGameQuery] = useState("");
  const [games, setGames] = useState<{ appid: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUserSearch = async () => {
    setLoading(true);
    try {
      const userData = await getUser(userId);
      setUser(userData);
      setGames([]); // Resetea la lista de juegos si es necesario
    } catch (error) {
      console.error("Error fetching user:", error);
    }
    setLoading(false);
  };

  const handleGameSearch = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const gamesData = await getUserGames(user.steamid); // gamesData es un array de números (appid)
  
      // Realiza la solicitud POST usando Axios
      const response = await axios.post('/api/get-game-names', {
        gameIds: gamesData, // Usa gamesData directamente
      });
  
      // Verifica si la respuesta es correcta
      if (response.status !== 200) {
        throw new Error('Error al obtener los nombres de los juegos.');
      }
  
      const gamesWithNames = response.data; // Obtiene los juegos con nombres
      setGames(gamesWithNames); // Asigna los juegos con nombres al estado
    } catch (error) {
      console.error('Error searching games:', error);
    } finally {
      setLoading(false); // Asegúrate de que el loading se apague
    }
  };

  // Filtra los juegos según la consulta
  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(gameQuery.toLowerCase())
  );

  return (
    <div className='container mx-auto p-4 space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda de Usuario y Juegos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex space-x-2'>
            <Input
              type='text'
              placeholder='Ingrese ID de usuario'
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            /> 
            <Button onClick={handleUserSearch} disabled={loading}>
              {loading ? "Buscando..." : "Buscar Usuario"}
            </Button>
          </div>

          {user && (
            <div className='mt-4'>
              <h2 className='text-xl font-bold'>Datos del Usuario</h2>
              <p>Nombre: {user.personaname}</p>
              <img
                src={user.avatarfull}
                alt={`${user.personaname} avatar`}
                className='mt-2 w-32 h-32 rounded-full'
              />
            </div>
          )}

          {user && (
            <div className="mt-4 space-y-2">
              <Input
                type="text"
                placeholder="Buscar juegos del usuario"
                value={gameQuery}
                onChange={(e) => setGameQuery(e.target.value)}
              />
              <Button onClick={handleGameSearch} disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar Juegos'}
              </Button>
            </div>
          )}

          {filteredGames.length > 0 && (
            <div className='mt-4'>
              <h2 className='text-xl font-bold'>Juegos Encontrados</h2>
              <ul className='space-y-2'>
                {filteredGames.map((game) => (
                  <li key={game.appid}>
                    <Link
                      href={`/game/${game.appid}`}
                      className='block bg-gray-100 p-2 rounded hover:bg-gray-200 transition-colors'
                    >
                      {game.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
