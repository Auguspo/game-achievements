"use client";
import SteamSearch from "@/components/SteamSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {




  return (
    <div className='p-4'>
      <Card className='max-w-md mx-auto bg-gray-100'> {/* Fondo añadido */}
        <CardHeader>
          <CardTitle className='text-center text-2xl font-bold'>Search by ID</CardTitle> {/* Título centrado y más grande */}
        </CardHeader>
        <CardContent>
          <SteamSearch />
          {/* Aquí puedes agregar cualquier otro contenido necesario */}
        </CardContent>
      </Card>
    </div>
  );
}
