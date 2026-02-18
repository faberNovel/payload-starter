import type { InfoSection } from '@/payload-types'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InfoSectionRenderer } from './InfoSectionRenderer'

afterEach(() => {
  cleanup()
})

// Mock the RichText component
vi.mock('@/components/RichText', () => ({
  default: ({ data }: any) => <div data-testid="rich-text">{JSON.stringify(data)}</div>,
}))

// Mock the Accordion component
vi.mock('./Accordion', () => ({
  Accordion: ({ items }: any) => (
    <div data-testid="accordion">
      {items.map((item: any) => (
        <div key={item.id} data-testid={`accordion-item-${item.id}`}>
          <span>{item.label}</span>
          <div>{item.children}</div>
        </div>
      ))}
    </div>
  ),
}))

const mockRichTextContent = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Test paragraph content', version: 1 }],
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
}

const mockSubcontent = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Subcontent text', version: 1 }],
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
}

const baseMockSection: InfoSection = {
  id: 1,
  title: 'Test Section Title',
  content: mockRichTextContent,
  subcontentdropdown: null,
  updatedAt: '2026-02-18T00:00:00.000Z',
  createdAt: '2026-02-18T00:00:00.000Z',
}

describe('InfoSectionRenderer', () => {
  describe('Rendering', () => {
    it('should render the section title as h2', () => {
      render(<InfoSectionRenderer section={baseMockSection} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Test Section Title')
    })

    it('should render rich text content', () => {
      render(<InfoSectionRenderer section={baseMockSection} />)

      const richText = screen.getAllByTestId('rich-text')[0]
      expect(richText).toBeInTheDocument()
    })

    it('should wrap content in info-section-content class', () => {
      const { container } = render(<InfoSectionRenderer section={baseMockSection} />)

      const contentWrapper = container.querySelector('.info-section-content')
      expect(contentWrapper).toBeInTheDocument()
    })

    it('should render as a section HTML element', () => {
      const { container } = render(<InfoSectionRenderer section={baseMockSection} />)

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should apply custom className when provided', () => {
      const { container } = render(
        <InfoSectionRenderer section={baseMockSection} className="custom-class" />,
      )

      const section = container.querySelector('section')
      expect(section).toHaveClass('custom-class')
    })
  })

  describe('Accordion / Subcontent Dropdown', () => {
    it('should not render Accordion when subcontentdropdown is null', () => {
      render(<InfoSectionRenderer section={baseMockSection} />)

      expect(screen.queryByTestId('accordion')).not.toBeInTheDocument()
    })

    it('should not render Accordion when subcontentdropdown is empty', () => {
      const section = { ...baseMockSection, subcontentdropdown: [] }
      render(<InfoSectionRenderer section={section} />)

      expect(screen.queryByTestId('accordion')).not.toBeInTheDocument()
    })

    it('should render Accordion when subcontentdropdown has items', () => {
      const section: InfoSection = {
        ...baseMockSection,
        subcontentdropdown: [
          { id: 'sub-1', label: 'Dropdown Label 1', subcontent: mockSubcontent },
          { id: 'sub-2', label: 'Dropdown Label 2', subcontent: mockSubcontent },
        ],
      }
      render(<InfoSectionRenderer section={section} />)

      expect(screen.getByTestId('accordion')).toBeInTheDocument()
    })

    it('should pass correct labels to Accordion items', () => {
      const section: InfoSection = {
        ...baseMockSection,
        subcontentdropdown: [
          { id: 'sub-1', label: 'Campus Marseille', subcontent: mockSubcontent },
          { id: 'sub-2', label: 'Campus Bordeaux', subcontent: mockSubcontent },
        ],
      }
      render(<InfoSectionRenderer section={section} />)

      expect(screen.getByText('Campus Marseille')).toBeInTheDocument()
      expect(screen.getByText('Campus Bordeaux')).toBeInTheDocument()
    })

    it('should render RichText for each subcontent item', () => {
      const section: InfoSection = {
        ...baseMockSection,
        subcontentdropdown: [{ id: 'sub-1', label: 'Item 1', subcontent: mockSubcontent }],
      }
      const { container } = render(<InfoSectionRenderer section={section} />)

      // 1 for main content + 1 for subcontent
      const richTexts = container.querySelectorAll('[data-testid="rich-text"]')
      expect(richTexts).toHaveLength(2)
    })

    it('should use item.id as accordion item id when available', () => {
      const section: InfoSection = {
        ...baseMockSection,
        subcontentdropdown: [{ id: 'custom-id', label: 'Test Label', subcontent: mockSubcontent }],
      }
      render(<InfoSectionRenderer section={section} />)

      expect(screen.getByTestId('accordion-item-custom-id')).toBeInTheDocument()
    })

    it('should fallback to label as id when item.id is null', () => {
      const section: InfoSection = {
        ...baseMockSection,
        subcontentdropdown: [{ id: null, label: 'Fallback Label', subcontent: mockSubcontent }],
      }
      render(<InfoSectionRenderer section={section} />)

      expect(screen.getByTestId('accordion-item-Fallback Label')).toBeInTheDocument()
    })
  })
})
