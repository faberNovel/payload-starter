'use client'

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import * as React from 'react'

import type { HeroSlide } from '@/payload-types'

import { CarouselControls } from './CarouselControls'
import { HeroSlidePanel } from './HeroSlidePanel'

interface HeroCarouselClientProps {
  slides: HeroSlide[]
  /** height/width ratio of the tallest image, used to lock carousel height */
  imageAspectRatio: number
}

export const HeroCarouselClient: React.FC<HeroCarouselClientProps> = ({
  slides,
  imageAspectRatio,
}) => {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api],
  )

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  if (slides.length === 0) return null

  return (
    <div className="relative mx-auto w-full max-w-[1400px] px-4 lg:px-8">
      <Carousel setApi={setApi} opts={{ loop: false, duration: 20 }} className="w-full">
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="pl-0">
              <HeroSlidePanel
                slide={slide}
                isFirst={index === 0}
                imageAspectRatio={imageAspectRatio}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Controls overlay — absolutely positioned so they don't move with slides */}
      <CarouselControls
        count={count}
        current={current}
        scrollTo={scrollTo}
        scrollPrev={scrollPrev}
        scrollNext={scrollNext}
      />
    </div>
  )
}
