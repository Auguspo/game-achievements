// components/GameView.tsx

import Image from "next/image";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
interface GameViewProps {
  appid: number;
  gameTitle: string;
  achievements: Achievement[];
}

interface Achievement {
  name: string; // ID o nombre único del logro
  defaultvalue: number; // Valor por defecto del logro
  displayName: string; // Nombre para mostrar del logro
  hidden: number; // Indica si el logro está oculto (1) o no (0)
  icon: string; // URL de la imagen del icono del logro
  icongray: string; // URL de la imagen en escala de grises del logro
  description: string; // Nombre para mostrar
  achieved: number; // Indica si el logro ha sido alcanzado (1) o no (0)
  unlocktime: number; // Tiempo de desbloqueo (timestamp)
  percent: number; // Porcentaje de jugadores que han desbloqueado este logro
}

const GameView: React.FC<GameViewProps> = ({ appid, gameTitle, achievements }) => {
  return (
<Card className='w-full max-w-md mx-auto'>
  <CardHeader>
    <CardTitle>{gameTitle}</CardTitle>
  </CardHeader>
  <CardContent className='space-y-4'>
    <Image
      src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg?t=1722458438`}
      alt={`${gameTitle} Header`}
      width={600}
      height={200}
      className='mt-2 w-full h-auto rounded'
      priority={true}
    />
    
    <div className='mt-4'>
      <h3 className='text-xl font-bold mb-2'>Logros:</h3>
      {achievements.map((achievement, index) => (
  <div key={index} className='flex items-start space-x-4 p-2 border border-gray-300 rounded-lg bg-gray-50'>
     {achievement.icon && (
      <div className='relative w-12 h-12 flex-shrink-0 flex items-center justify-center my-auto'>
        <Image
          src={achievement.icon}
          alt={achievement.displayName}
          layout='fill'
          objectFit='contain'
          className='rounded'
        />
      </div>
    )}
    <div className='flex-grow'>
      <h4 className='font-semibold'>
        {achievement.name}: {achievement.displayName}
      </h4>
      <p >{achievement.hidden ? "No description" : achievement.description || "No descriptcion"}</p>
      <p>Global achievement percentage: {achievement.percent.toFixed(2)}%</p>
    </div>
  </div>
))}


      </div>
   
  </CardContent>
</Card>

  );
};

export default GameView;
