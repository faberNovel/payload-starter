import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSlidePanel } from './HeroSlidePanel'
import type { HeroSlide } from '@/payload-types'

// Mock the Media component
vi.mock('@/components/Media', () => ({
  Media: ({ resource, priority }: any) => (
    <div data-testid="media-component" data-priority={priority}>
      {resource?.alt || 'Mock Media'}
    </div>
  ),
}))

// Mock the RichText component
vi.mock('@/components/RichText', () => ({
  default: ({ data }: any) => <div data-testid="rich-text">{JSON.stringify(data)}</div>,
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('HeroSlidePanel', () => {
  const mockImage = {
    id: 'img-1',
    alt: 'Test image',
    url: '/test-image.jpg',
    width: 1200,
    height: 800,
  }

  const mockSlide: HeroSlide = {
    id: 'slide-1',
    headline: 'Test Headline',
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Test content' }],
          },
        ],
      },
    },
    label: 'Learn More',
    url: '/test-url',
    image: mockImage,
  }

  describe('Rendering', () => {
    it('should render headline', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const headline = container.querySelector('h3')
      expect(headline).toBeInTheDocument()
      expect(headline).toHaveTextContent('Test Headline')
    })

    it('should render content when provided', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const richText = container.querySelector('[data-testid="rich-text"]')
      expect(richText).toBeInTheDocument()
    })

    it('should not render content area when content is missing', () => {
      const slideWithoutContent = { ...mockSlide, content: undefined }
      const { container } = render(
        <HeroSlidePanel slide={slideWithoutContent} isFirst={false} imageAspectRatio={0.667} />,
      )
      expect(container.querySelector('[data-testid="rich-text"]')).not.toBeInTheDocument()
    })

    it('should render CTA button when label and url are provided', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const button = container.querySelector('.btn-primary')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Learn More')
      expect(button).toHaveAttribute('href', '/test-url')
    })

    it('should not render CTA when label is missing', () => {
      const slideWithoutLabel = { ...mockSlide, label: undefined }
      const { container } = render(
        <HeroSlidePanel slide={slideWithoutLabel} isFirst={false} imageAspectRatio={0.667} />,
      )
      expect(container.querySelector('.btn-primary')).not.toBeInTheDocument()
    })

    it('should not render CTA when url is missing', () => {
      const slideWithoutUrl = { ...mockSlide, url: undefined }
      const { container } = render(
        <HeroSlidePanel slide={slideWithoutUrl} isFirst={false} imageAspectRatio={0.667} />,
      )
      expect(container.querySelector('.btn-primary')).not.toBeInTheDocument()
    })

    it('should render Media component with image', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const mediaComponent = container.querySelector('[data-testid="media-component"]')
      expect(mediaComponent).toBeInTheDocument()
      expect(mediaComponent).toHaveTextContent('Test image')
    })

    it('should not render Media when image is missing', () => {
      const slideWithoutImage = { ...mockSlide, image: undefined }
      const { container } = render(
        <HeroSlidePanel slide={slideWithoutImage} isFirst={false} imageAspectRatio={0.667} />,
      )
      expect(container.querySelector('[data-testid="media-component"]')).not.toBeInTheDocument()
    })
  })

  describe('Priority Loading', () => {
    it('should set priority to true for first slide', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={true} imageAspectRatio={0.667} />,
      )
      const mediaComponent = container.querySelector('[data-testid="media-component"]')
      expect(mediaComponent).toHaveAttribute('data-priority', 'true')
    })

    it('should set priority to false for non-first slides', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const mediaComponent = container.querySelector('[data-testid="media-component"]')
      expect(mediaComponent).toHaveAttribute('data-priority', 'false')
    })
  })

  describe('CSS Classes', () => {
    it('should apply hero-slide-panel class to content panel', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const panel = container.querySelector('.hero-slide-panel')
      expect(panel).toBeInTheDocument()
    })

    it('should apply theme colors to content panel', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const panel = container.querySelector('.hero-slide-panel')
      expect(panel).toHaveClass('bg-primary')
      expect(panel).toHaveClass('text-primary-foreground')
    })

    it('should apply btn-primary class to CTA button', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const button = container.querySelector('.btn-primary')
      expect(button).toHaveClass('btn-primary')
      expect(button).toHaveTextContent('Learn More')
    })

    it('should apply rounded corners to both panels', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const leftPanel = container.querySelector('.rounded-l-xl')
      const rightPanel = container.querySelector('.rounded-r-xl')
      expect(leftPanel).toBeInTheDocument()
      expect(rightPanel).toBeInTheDocument()
    })
  })

  describe('Aspect Ratio', () => {
    it('should calculate CSS aspect ratio correctly', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const imageContainer = container.querySelector('.rounded-r-xl')
      const style = imageContainer?.getAttribute('style')
      expect(style).toContain('aspect-ratio')
      expect(style).toContain('1.499')
    })

    it('should not set aspect ratio when imageAspectRatio is 0', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0} />,
      )
      const imageContainer = container.querySelector('.rounded-r-xl')
      expect(imageContainer).not.toHaveStyle({ aspectRatio: expect.any(String) })
    })

    it('should not set aspect ratio when imageAspectRatio is negative', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={-1} />,
      )
      const imageContainer = container.querySelector('.rounded-r-xl')
      expect(imageContainer).not.toHaveStyle({ aspectRatio: expect.any(String) })
    })
  })

  describe('Layout Structure', () => {
    it('should use grid layout with 2 columns on large screens', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const gridContainer = container.firstChild
      expect(gridContainer).toHaveClass('grid')
      expect(gridContainer).toHaveClass('lg:grid-cols-2')
    })

    it('should apply proper flexbox layout to content panel', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const contentPanel = container.querySelector('.hero-slide-panel')
      expect(contentPanel).toHaveClass('flex')
      expect(contentPanel).toHaveClass('flex-col')
      expect(contentPanel).toHaveClass('justify-center')
    })
  })

  describe('Typography', () => {
    it('should apply responsive font sizes to headline', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const headline = container.querySelector('h3')
      expect(headline).toHaveClass('text-xl')
      expect(headline).toHaveClass('lg:text-2xl')
      expect(headline).toHaveClass('xl:text-3xl')
    })

    it('should apply opacity to content text', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const contentWrapper = container.querySelector('.opacity-80')
      expect(contentWrapper).toBeInTheDocument()
    })

    it('should inherit text color from parent', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const headline = container.querySelector('h3')
      expect(headline).toHaveClass('text-inherit')
    })
  })

  describe('Edge Cases', () => {
    it('should handle slide with all optional fields missing', () => {
      const minimalSlide: HeroSlide = {
        id: 'minimal',
        headline: 'Minimal Slide',
      }
      const { container } = render(
        <HeroSlidePanel slide={minimalSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      expect(screen.getByText('Minimal Slide')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="rich-text"]')).not.toBeInTheDocument()
      expect(container.querySelector('.btn-primary')).not.toBeInTheDocument()
      expect(container.querySelector('[data-testid="media-component"]')).not.toBeInTheDocument()
    })

    it('should handle image as string id reference', () => {
      const slideWithImageId = { ...mockSlide, image: 'string-id' }
      const { container } = render(
        <HeroSlidePanel slide={slideWithImageId} isFirst={false} imageAspectRatio={0.667} />,
      )
      // When image is string, Media component should not render
      expect(container.querySelector('[data-testid="media-component"]')).not.toBeInTheDocument()
    })

    it('should handle very large aspect ratios', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={10} />,
      )
      const imageContainer = container.querySelector('.rounded-r-xl')
      expect(imageContainer).toHaveStyle({ aspectRatio: '0.1' })
    })

    it('should handle very small aspect ratios', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.01} />,
      )
      const imageContainer = container.querySelector('.rounded-r-xl')
      expect(imageContainer).toHaveStyle({ aspectRatio: '100' })
    })
  })

  describe('Content Integration', () => {
    it('should pass correct props to RichText component', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={false} imageAspectRatio={0.667} />,
      )
      const richText = container.querySelector('[data-testid="rich-text"]')
      expect(richText).toBeInTheDocument()
      // RichText should receive the content data
      expect(richText?.textContent).toContain('root')
    })

    it('should pass correct props to Media component', () => {
      const { container } = render(
        <HeroSlidePanel slide={mockSlide} isFirst={true} imageAspectRatio={0.667} />,
      )
      const media = container.querySelector('[data-testid="media-component"]')
      expect(media).toHaveAttribute('data-priority', 'true')
      expect(media).toHaveTextContent('Test image')
    })
  })
})
