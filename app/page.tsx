"use client";
import { useState } from "react";
import SteamSearch from "@/components/SteamSearch";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Agrega aquí la lógica para buscar el ID
    console.log("Buscando ID:", value);
  };

  return (
    <div className='p-4'>
      <h1 className='text-2xl mb-4'>Buscar por ID</h1>
      <SteamSearch onSearch={handleSearch} />
      
    </div>
  );
}
