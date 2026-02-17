import Link from 'next/link'
import React from 'react'

import type { HeroSlide } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

interface HeroSlidePanelProps {
  slide: HeroSlide
  isFirst: boolean
  /** height/width ratio of the tallest image */
  imageAspectRatio: number
}

export const HeroSlidePanel: React.FC<HeroSlidePanelProps> = ({
  slide,
  isFirst,
  imageAspectRatio,
}) => {
  // Convert h/w ratio to w/h for CSS aspect-ratio (width / height)
  const cssAspectRatio = imageAspectRatio > 0 ? 1 / imageAspectRatio : undefined

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {/* Left panel — yellow background with text content */}
      <div className="hero-slide-panel flex flex-col justify-center rounded-l-xl bg-primary text-primary-foreground">
        <h3 className="mb-4 text-xl font-bold leading-tight lg:text-2xl xl:text-3xl text-inherit">
          {slide.headline}
        </h3>

        {slide.content && (
          <div className="mb-6 text-sm leading-relaxed opacity-80 lg:text-base text-inherit">
            <RichText data={slide.content} enableGutter={false} className="text-inherit" />
          </div>
        )}

        {slide.label && slide.url && (
          <div>
            <Link href={slide.url} className="btn-primary">
              {slide.label}
            </Link>
          </div>
        )}
      </div>

      {/* Right panel — height locked to tallest image aspect ratio */}
      <div
        className="relative overflow-hidden rounded-r-xl"
        style={cssAspectRatio ? { aspectRatio: `${cssAspectRatio}` } : undefined}
      >
        {slide.image && typeof slide.image === 'object' && (
          <Media fill imgClassName="object-cover" resource={slide.image} priority={isFirst} />
        )}
      </div>
    </div>
  )
}
