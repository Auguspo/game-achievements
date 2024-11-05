import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shared.cloudflare.steamstatic.com',
        port: '', // Deja vacío si no usas un puerto específico
        pathname: '/store_item_assets/steam/apps/**', // Permite el acceso a las imágenes de Cloudflare
      },
      {
        protocol: 'https',
        hostname: 'steamcdn-a.akamaihd.net',
        port: '', // Deja vacío si no usas un puerto específico
        pathname: '/steamcommunity/public/images/apps/**', // Asegúrate de que el patrón de pathname sea correcto
      },
    ],
  },
  // Otras configuraciones que necesites
};

export default nextConfig;
