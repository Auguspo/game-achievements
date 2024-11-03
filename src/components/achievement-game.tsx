'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AchievementGameProps {
  gameTitle: string
  id: string // Cambiado de imageSrc y achievementName a id
}

// Simulación de una llamada GET para obtener el porcentaje
const fetchPercentage = async (): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simula un retraso de red
  return Math.floor(Math.random() * 101) // Retorna un número aleatorio entre 0 y 100
}

export default function AchievementGame({ gameTitle, id }: AchievementGameProps) {
  const [percentage, setPercentage] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const getPercentage = async () => {
      try {
        const fetchedPercentage = await fetchPercentage()
        setPercentage(fetchedPercentage)
      } catch (error) {
        console.error('Error al obtener el porcentaje:', error)
      } finally {
        setLoading(false)
      }
    }

    getPercentage()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{gameTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full h-48">
          <Image
            src={`/images/games/${id}.jpg`} // Suponiendo que la imagen está en esta ruta
            alt={`Imagen de ${gameTitle}`} // Ajustado para que use gameTitle
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        {loading ? (
          <p>Cargando porcentaje...</p>
        ) : (
          <div className="space-y-2">
            <Progress value={percentage} className="w-full" />
            <p className="text-sm text-gray-500">Progreso: {percentage}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
