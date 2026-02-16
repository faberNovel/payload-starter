'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import * as React from 'react'

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className="mx-auto">
      <Carousel setApi={setApi} className="">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="flex">
              <Card className="m-px flex-1">
                <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                  <h1 className="text-4xl font-semibold">
                    KEDGE Master Tour 2026 - Et si votre avenir commençait ici ?
                  </h1>
                  <p>
                    Rencontrez nos équipes et donnez une nouvelle dimension à votre projet
                    professionnel. 10 villes françaises, de février à avril, pour un accompagnement
                    individualisé et adapté à vos besoins.
                  </p>
                </CardContent>
              </Card>
              <Card className="m-px flex-1">
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="text-muted-foreground py-2 text-center text-sm">
        Slide {current} of {count}
      </div>
    </div>
  )
}
