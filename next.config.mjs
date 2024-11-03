/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/steam/:path*', // La ruta que usarás en tu aplicación
          destination: 'http://api.steampowered.com/:path*', // La URL de la API de Steam
        },
      ];
    },
  };
  
  export default nextConfig;
  