// components/GameView.tsx

import Image from "next/image";
import React from "react";

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
    <div className='border p-4 rounded shadow-md'>
      <h2 className='text-2xl font-semibold'>{gameTitle}</h2>
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {achievements.map((achievement) => (
            <div key={achievement.name} className='border p-2 rounded shadow-sm'>
              <Image
                src={achievement.icon}
                alt={achievement.displayName}
                width={64}
                height={64}
                className='mb-2'
              />
              <h4 className='font-semibold'>{achievement.name}: {achievement.displayName}</h4>
              <p>{achievement.hidden ? " " : achievement.description}</p>
              <p>Porcentaje de desbloqueo: {achievement.percent.toFixed(2)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameView;
