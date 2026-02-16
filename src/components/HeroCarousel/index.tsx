import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { HeroCarouselClient } from './HeroCarouselClient'

/**
 * Server component that fetches hero slides from the HeroSlides collection
 * and passes them to the client carousel.
 */
export async function HeroCarousel() {
  const payload = await getPayload({ config: configPromise })

  const { docs: slides } = await payload.find({
    collection: 'heroSlides',
    limit: 10,
    depth: 1, // populate the image relationship
    sort: 'createdAt',
  })

  if (!slides || slides.length === 0) return null

  // Find the tallest image aspect ratio (height/width) to lock carousel height
  let tallestRatio = 0
  for (const slide of slides) {
    if (slide.image && typeof slide.image === 'object' && slide.image.width && slide.image.height) {
      const ratio = slide.image.height / slide.image.width
      if (ratio > tallestRatio) tallestRatio = ratio
    }
  }

  return <HeroCarouselClient slides={slides} imageAspectRatio={tallestRatio || 0.44} />
}
