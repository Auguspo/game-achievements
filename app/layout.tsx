import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <header className="bg-gray-800 text-white p-4">
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/" className="hover:underline">Inicio</Link></li>
              <li><Link href="/about" className="hover:underline">Acerca de</Link></li>
              <li><Link href="/contact" className="hover:underline">Contacto</Link></li>
            </ul>
          </nav>
        </header>

        <main className="container mx-auto mt-8 px-4">
          {children}
        </main>

        <footer className="bg-gray-800 text-white p-4 mt-8">
          <p className="text-center">&copy; 2023 Mi Aplicación Next.js. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  )
}