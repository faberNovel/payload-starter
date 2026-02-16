import Link from 'next/link'
import React from 'react'

import type { HeroSlide } from '@/payload-types'

import { Media } from '@/components/Media'

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
      <div className="flex flex-col justify-center rounded-l-xl bg-[#F5C518] p-8 pb-20 lg:p-12 lg:pb-24">
        <h3 className="mb-4 text-xl font-bold leading-tight text-black lg:text-2xl xl:text-3xl">
          {slide.headline}
        </h3>

        {slide.content && (
          <p className="mb-6 text-sm leading-relaxed text-black/80 lg:text-base">
            {extractPlainText(slide.content)}
          </p>
        )}

        {slide.label && slide.url && (
          <div>
            <Link
              href={slide.url}
              className="inline-block rounded-sm border-2 border-black bg-black px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-black"
            >
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

/**
 * Extract plain text from a Lexical richText root node.
 * We walk the tree and concatenate all text node values.
 */
function extractPlainText(richText: HeroSlide['content']): string {
  if (!richText?.root?.children) return ''

  const texts: string[] = []

  function walk(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'text' && typeof node.text === 'string') {
        texts.push(node.text)
      }
      if (node.children) {
        walk(node.children)
      }
    }
  }

  walk(richText.root.children)
  return texts.join(' ')
}
