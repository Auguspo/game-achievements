import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GameList from "./GameList"; // Asegúrate de que la ruta sea correcta
import { AxiosError } from "axios";
import Image from "next/image";

const SteamSearch: React.FC = () => {
  const [steamId, setSteamId] = useState<string>("");
  const [data, setData] = useState<{
    personaname: string;
    avatarfull: string;
  } | null>(null);
  const [showGames, setShowGames] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!steamId) {
      setError("Please enter a Steam ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/steam/user?steamId=${steamId}`);
      const result = await response.json();

      if (
        response.ok &&
        result.response &&
        result.response.players.length > 0
      ) {
        const player = result.response.players[0];
        setData({
          personaname: player.personaname,
          avatarfull: player.avatarfull,
        });
        setShowGames(true);
      } else {
        setData({ personaname: "No data found", avatarfull: "" });
        setShowGames(false);
        setError("No data found for the provided Steam ID.");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("Error searching Steam data:", error);
        setData({ personaname: "Error occurred", avatarfull: "" });
        setShowGames(false);
        setError(
          `An error occurred while searching for the Steam data: ${error.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 ">
      <div className="flex items-center w-full max-w-md">
        <Input
          type="number"
          placeholder="Enter Steam ID"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          className="flex-grow bg-gray-100" // Cambia el color de fondo aquí
          minLength={17}
          maxLength={17}
          required // Añade el atributo requerido
          onWheel={(e) => e.currentTarget.blur()} // Elimina el spinner al girar la rueda del mouse
        />
        <Button onClick={handleSearch} className="ml-2" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      {error && <div className="text-red-500 font-medium">{error}</div>}
      {data && (
        <div className="mt-4 flex flex-col items-center">
          <h3 className="text-2xl font-bold">{data.personaname}</h3> {/* Título más grande */}
          <Image
  src={data.avatarfull}
  alt={`${data.personaname} avatar`}
  width={128} // 32 * 4 (la imagen se escalará a 32px)
  height={128} // 32 * 4 (la imagen se escalará a 32px)
  className="rounded-full mt-2"
/>
        </div>
      )}
      {showGames && steamId && <GameList steamId={steamId} />}
    </div>
  );
};

export default SteamSearch;
