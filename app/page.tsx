"use client";
import { useState } from "react";
import SteamSearch from "@/components/SteamSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Agrega aquí la lógica para buscar el ID
    console.log("Buscando ID:", value);
  };

  return (
    <div className='p-4'>
      <Card className='max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='text-2xl'>Search by ID</CardTitle>
        </CardHeader>
        <CardContent>
          <SteamSearch  />
          {/* Aquí puedes agregar cualquier otro contenido necesario */}
        </CardContent>
      </Card>
    </div>
  );
}
