'use client'

import React from 'react'
import type { CarouselBlock as CarouselBlockType } from '@/payload-types'
import { HeroCarouselClient } from '@/components/HeroCarousel/HeroCarouselClient'
import type { HeroSlide } from '@/payload-types'

type Props = CarouselBlockType & {
  disableInnerContainer?: boolean
}

export const CarouselBlock: React.FC<Props> = ({ slides }) => {
  if (!slides || slides.length === 0) return null

  // Calculate the tallest image aspect ratio (height/width) to lock carousel height
  let tallestRatio = 0
  for (const slide of slides) {
    if (slide.image && typeof slide.image === 'object' && slide.image.width && slide.image.height) {
      const ratio = slide.image.height / slide.image.width
      if (ratio > tallestRatio) tallestRatio = ratio
    }
  }

  // Convert our slides to HeroSlide format (they already match!)
  const heroSlides = slides as unknown as HeroSlide[]

  return <HeroCarouselClient slides={heroSlides} imageAspectRatio={tallestRatio || 0.44} />
}
