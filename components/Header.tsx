"use client";
import { useState } from "react";
import { useRouter,usePathname } from "next/navigation";
import Image from "next/image";

const Header = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleHeaderClick = () => {
    // Verifica si no estás en la ruta principal
    if (pathname !== "/") {
      setIsAnimating(true); // Inicia la animación
      setTimeout(() => {
        setIsAnimating(false);
        router.push("/"); // Redirige después de la animación
      }, 500); // Ajusta el tiempo de acuerdo con la duración de la animación
    }
  };

  return (
    <header
      className='flex items-center mb-4 my-4 cursor-pointer'
      onClick={handleHeaderClick}
    >
      <Image
        src='/crosshair.png'
        alt='Icono'
        className={`mr-2 transition-all duration-300 ${
          isAnimating ? "scale-150" : "scale-100"
        }`} // Transición de escala
        width={50}
        height={50}
      />
      <h1 className='text-2xl font-bold'>Achievement Targetter</h1>
    </header>
  );
};

export default Header;
