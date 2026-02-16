import { cn } from '@/utilities/ui'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'

interface CarouselControlsProps {
  count: number
  current: number
  scrollTo: (index: number) => void
  scrollPrev: () => void
  scrollNext: () => void
}

export const CarouselControls: React.FC<CarouselControlsProps> = ({
  count,
  current,
  scrollTo,
  scrollPrev,
  scrollNext,
}) => {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 z-10 flex w-full items-center justify-between px-8 pb-6 lg:w-1/2 lg:px-12 lg:pb-8">
      {/* Pagination dots — pill for active, circle for inactive */}
      <div className="pointer-events-auto flex items-center gap-2 ml-8">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'h-3 rounded-full transition-all duration-300',
              i === current ? 'w-8 bg-black/70' : 'w-3 bg-white/80',
            )}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          onClick={scrollPrev}
          disabled={current === 0}
          aria-label="Previous slide"
          className={cn(
            'group flex h-12 w-12 items-center justify-center rounded-full transition-colors',
            current === 0 ? 'cursor-not-allowed bg-white/60' : 'bg-white hover:bg-black',
          )}
        >
          <ArrowLeft
            className={cn(
              'h-5 w-5 transition-colors',
              current === 0 ? 'text-black/20' : 'text-black/60 group-hover:text-white',
            )}
          />
        </button>
        <button
          onClick={scrollNext}
          disabled={current === count - 1}
          aria-label="Next slide"
          className={cn(
            'group flex h-12 w-12 items-center justify-center rounded-full transition-colors',
            current === count - 1 ? 'cursor-not-allowed bg-white/60' : 'bg-white hover:bg-black',
          )}
        >
          <ArrowRight
            className={cn(
              'h-5 w-5 transition-colors',
              current === count - 1 ? 'text-black/20' : 'text-black/60 group-hover:text-white',
            )}
          />
        </button>
      </div>
    </div>
  )
}
