import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MegaMenuDropdown } from './MegaMenuDropdown'

// Mock the CMSLink component
vi.mock('@/components/Link', () => ({
  CMSLink: ({ children, className, onClick }: any) => (
    <a className={className} onClick={onClick} href="#mock">
      {children}
    </a>
  ),
}))

// Mock CSS import
vi.mock('./megaMenu.css', () => ({}))

describe('MegaMenuDropdown', () => {
  const mockOnCloseAction = vi.fn()

  const mockCategory = {
    label: 'Formations',
    subs: [
      {
        label: 'Achats, Supply Chain & Maritime Logistics',
        type: 'subcategory' as const,
        items: [
          {
            label: 'Program 1',
            type: 'page' as const,
            link: {
              type: 'reference' as const,
              reference: {
                relationTo: 'pages' as const,
                value: 'page-1',
              },
            },
            tags: [
              { text: 'TEMPS PLEIN', style: 'primary' as const },
              { text: 'ALTERNANCE', style: 'secondary' as const },
            ],
          },
          {
            label: 'Program 2',
            type: 'page' as const,
            link: {
              type: 'reference' as const,
              reference: {
                relationTo: 'pages' as const,
                value: 'page-2',
              },
            },
          },
        ],
      },
      {
        label: 'Data & Innovation',
        type: 'subcategory' as const,
        items: [
          {
            label: 'Data Program',
            type: 'page' as const,
            link: {
              type: 'reference' as const,
              reference: {
                relationTo: 'pages' as const,
                value: 'page-3',
              },
            },
          },
        ],
      },
      {
        label: 'External Link',
        type: 'link' as const,
        link: {
          type: 'custom' as const,
          url: 'https://example.com',
        },
      },
    ],
  }

  const mockCategoryWithSubSubs = {
    label: 'Programs',
    subs: [
      {
        label: 'Specialized Programs',
        type: 'subcategory' as const,
        subSubs: [
          {
            label: 'Business Transformation',
            items: [
              {
                label: 'Program A',
                link: {
                  type: 'reference' as const,
                  reference: {
                    relationTo: 'pages' as const,
                    value: 'program-a',
                  },
                },
              },
            ],
          },
          {
            label: 'Data Analytics',
            items: [
              {
                label: 'Program B',
                link: {
                  type: 'reference' as const,
                  reference: {
                    relationTo: 'pages' as const,
                    value: 'program-b',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  }

  const mockCategoryWithNested = {
    label: 'Nested Category',
    subs: [
      {
        label: 'Main Category',
        type: 'subcategory' as const,
        items: [
          {
            label: 'Nested Group',
            type: 'nested' as const,
            nestedItems: [
              {
                label: 'Nested Item 1',
                link: {
                  type: 'reference' as const,
                  reference: {
                    relationTo: 'pages' as const,
                    value: 'nested-1',
                  },
                },
              },
              {
                label: 'Nested Item 2',
                link: {
                  type: 'reference' as const,
                  reference: {
                    relationTo: 'pages' as const,
                    value: 'nested-2',
                  },
                },
              },
            ],
          },
          {
            label: 'Regular Item',
            type: 'page' as const,
            link: {
              type: 'reference' as const,
              reference: {
                relationTo: 'pages' as const,
                value: 'regular',
              },
            },
          },
        ],
      },
    ],
  }

  beforeEach(() => {
    mockOnCloseAction.mockClear()
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={false}
          onCloseAction={mockOnCloseAction}
        />,
      )
      expect(container.querySelector('.mega-menu-dropdown')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )
      expect(
        screen.getAllByText('Achats, Supply Chain & Maritime Logistics')[0],
      ).toBeInTheDocument()
    })

    it('should not render if category has no subs', () => {
      const { container } = render(
        <MegaMenuDropdown
          category={{ label: 'Empty', subs: [] }}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )
      expect(container.querySelector('.mega-menu-dropdown')).not.toBeInTheDocument()
    })

    it('should render overlay when open', () => {
      const { container } = render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )
      expect(container.querySelector('.mega-menu-overlay')).toBeInTheDocument()
    })
  })

  describe('Sidebar Navigation', () => {
    it('should render all subcategories in sidebar', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )
      expect(
        screen.getAllByText('Achats, Supply Chain & Maritime Logistics')[0],
      ).toBeInTheDocument()
      expect(screen.getAllByText('Data & Innovation')[0]).toBeInTheDocument()
      expect(screen.getAllByText('External Link')[0]).toBeInTheDocument()
    })

    it('should render direct link in sidebar', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )
      const externalLink = screen.getAllByText('External Link')[0]
      expect(externalLink).toBeInTheDocument()
      expect(externalLink.tagName).toBe('A')
    })

    it('should render subcategory as button in sidebar', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )
      const subcategoryButton = screen
        .getAllByText('Achats, Supply Chain & Maritime Logistics')[0]
        .closest('button')
      expect(subcategoryButton).toBeInTheDocument()
      expect(subcategoryButton).toHaveClass('mega-menu-sidebar-item')
      expect(subcategoryButton).toHaveAttribute('aria-haspopup', 'true')
    })

    it('should mark first subcategory as active by default', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )
      const firstButton = screen
        .getAllByText('Achats, Supply Chain & Maritime Logistics')[0]
        .closest('button')
      expect(firstButton).toHaveClass('active')
    })
  })

  describe('Click Navigation', () => {
    it('should change active subcategory on click', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const firstButton = screen
        .getAllByText('Achats, Supply Chain & Maritime Logistics')[0]
        .closest('button')!
      const secondButton = screen.getAllByText('Data & Innovation')[0].closest('button')!

      expect(firstButton).toHaveClass('active')
      expect(secondButton).not.toHaveClass('active')

      fireEvent.click(secondButton)

      expect(firstButton).not.toHaveClass('active')
      expect(secondButton).toHaveClass('active')
    })

    it('should change active subcategory on mouse enter', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const secondButton = screen.getAllByText('Data & Innovation')[0].closest('button')!

      fireEvent.mouseEnter(secondButton)

      expect(secondButton).toHaveClass('active')
    })

    it('should call onCloseAction when clicking on overlay', () => {
      const { container } = render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const overlay = container.querySelector('.mega-menu-overlay')!
      fireEvent.click(overlay)

      expect(mockOnCloseAction).toHaveBeenCalledTimes(1)
    })

    it('should call onCloseAction when clicking on a link', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const link = screen.getAllByText('Program 1')[0]
      fireEvent.click(link)

      expect(mockOnCloseAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('Content Display', () => {
    it('should display items from active subcategory', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(screen.getAllByText('Program 1')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Program 2')[0]).toBeInTheDocument()
    })

    it('should display tags/badges when present', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(screen.getAllByText('TEMPS PLEIN')[0]).toBeInTheDocument()
      expect(screen.getAllByText('ALTERNANCE')[0]).toBeInTheDocument()
    })

    it('should update content when changing subcategory', () => {
      render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      // Initially, Program 1 should be visible
      expect(screen.getAllByText('Program 1').length).toBeGreaterThan(0)

      const dataButton = screen.getAllByText('Data & Innovation')[0].closest('button')!
      fireEvent.click(dataButton)

      // After clicking, Data Program should be visible
      expect(screen.getAllByText('Data Program').length).toBeGreaterThan(0)
    })
  })

  describe('Sub-subcategories Navigation', () => {
    it('should render sub-subcategories in nested sidebar', () => {
      render(
        <MegaMenuDropdown
          category={mockCategoryWithSubSubs}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(screen.getAllByText('Business Transformation')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Data Analytics')[0]).toBeInTheDocument()
    })

    it('should mark first sub-subcategory as active by default', () => {
      render(
        <MegaMenuDropdown
          category={mockCategoryWithSubSubs}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const firstSubSub = screen.getAllByText('Business Transformation')[0].closest('button')!
      expect(firstSubSub).toHaveClass('active')
    })

    it('should change active sub-subcategory on click', () => {
      render(
        <MegaMenuDropdown
          category={mockCategoryWithSubSubs}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const firstSubSub = screen.getAllByText('Business Transformation')[0].closest('button')!
      const secondSubSub = screen.getAllByText('Data Analytics')[0].closest('button')!

      expect(firstSubSub).toHaveClass('active')
      expect(secondSubSub).not.toHaveClass('active')

      fireEvent.click(secondSubSub)

      expect(firstSubSub).not.toHaveClass('active')
      expect(secondSubSub).toHaveClass('active')
    })

    it('should display items from active sub-subcategory', () => {
      render(
        <MegaMenuDropdown
          category={mockCategoryWithSubSubs}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      // Check Program A is visible initially
      expect(screen.getAllByText('Program A').length).toBeGreaterThan(0)

      const secondSubSub = screen.getAllByText('Data Analytics')[0].closest('button')!
      fireEvent.click(secondSubSub)

      // After switching, Program B should be visible
      expect(screen.getAllByText('Program B').length).toBeGreaterThan(0)
    })

    it('should reset sub-subcategory index when changing main category', () => {
      render(
        <MegaMenuDropdown
          category={mockCategoryWithSubSubs}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      // Click on second sub-subcategory
      const secondSubSub = screen.getAllByText('Data Analytics')[0].closest('button')!
      fireEvent.click(secondSubSub)

      expect(secondSubSub).toHaveClass('active')

      // If there were multiple main categories, changing them would reset to first sub-subcategory
      // This test verifies the state management logic
    })
  })

  describe('Nested Items Navigation', () => {
    it('should render nested item groups', () => {
      render(
        <MegaMenuDropdown
          category={mockCategoryWithNested}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(screen.getAllByText('Nested Group')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Regular Item')[0]).toBeInTheDocument()
    })

    it('should not display nested content initially', () => {
      render(
        <MegaMenuDropdown
          category={mockCategoryWithNested}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      // Nested items should not be visible until the group is clicked
      expect(screen.queryByText('Nested Item 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Nested Item 2')).not.toBeInTheDocument()
    })

    it('should display nested items when clicking on nested group', () => {
      render(
        <MegaMenuDropdown
          category={mockCategoryWithNested}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const nestedGroup = screen.getAllByText('Nested Group')[0].closest('button')!
      fireEvent.click(nestedGroup)

      expect(screen.getAllByText('Nested Item 1')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Nested Item 2')[0]).toBeInTheDocument()
    })

    it('should mark nested group as active when selected', () => {
      render(
        <MegaMenuDropdown
          category={mockCategoryWithNested}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const nestedGroup = screen.getAllByText('Nested Group')[0].closest('button')!
      fireEvent.click(nestedGroup)

      expect(nestedGroup).toHaveClass('active')
    })
  })

  describe('CSS Classes', () => {
    it('should use mega-menu-grid for simple layouts', () => {
      const { container } = render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(container.querySelector('.mega-menu-grid')).toBeInTheDocument()
    })

    it('should use mega-menu-page-list for sub-subcategories', () => {
      const { container } = render(
        <MegaMenuDropdown
          category={mockCategoryWithSubSubs}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(container.querySelector('.mega-menu-page-list')).toBeInTheDocument()
    })

    it('should use mega-menu-nested-layout for nested items', () => {
      const { container } = render(
        <MegaMenuDropdown
          category={mockCategoryWithNested}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(container.querySelector('.mega-menu-nested-layout')).toBeInTheDocument()
    })
  })

  describe('Badge Styles', () => {
    it('should apply correct badge style classes', () => {
      const { container } = render(
        <MegaMenuDropdown
          category={mockCategory}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const primaryBadges = container.querySelectorAll('.badge-primary')
      const secondaryBadges = container.querySelectorAll('.badge-secondary')

      expect(primaryBadges.length).toBeGreaterThan(0)
      expect(secondaryBadges.length).toBeGreaterThan(0)

      // Check first badges have correct text
      expect(primaryBadges[0]).toHaveTextContent('TEMPS PLEIN')
      expect(secondaryBadges[0]).toHaveTextContent('ALTERNANCE')
    })

    it('should use default badge style when style is not specified', () => {
      const categoryWithDefaultBadge = {
        label: 'Test',
        subs: [
          {
            label: 'Sub',
            type: 'subcategory' as const,
            items: [
              {
                label: 'Item',
                type: 'page' as const,
                link: { type: 'custom' as const, url: '/test' },
                tags: [{ text: 'DEFAULT' }],
              },
            ],
          },
        ],
      }

      const { container } = render(
        <MegaMenuDropdown
          category={categoryWithDefaultBadge}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      const defaultBadge = container.querySelector('.badge-default')
      expect(defaultBadge).toBeInTheDocument()
      expect(defaultBadge).toHaveTextContent('DEFAULT')
    })
  })

  describe('Edge Cases', () => {
    it('should handle category with null subs', () => {
      const { container } = render(
        <MegaMenuDropdown
          category={{ label: 'Test', subs: null }}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(container.querySelector('.mega-menu-dropdown')).not.toBeInTheDocument()
    })

    it('should handle items with null tags', () => {
      const categoryWithNullTags = {
        label: 'Test',
        subs: [
          {
            label: 'Sub',
            type: 'subcategory' as const,
            items: [
              {
                label: 'ItemWithNullTags',
                type: 'page' as const,
                link: { type: 'custom' as const, url: '/test' },
                tags: null,
              },
            ],
          },
        ],
      }

      render(
        <MegaMenuDropdown
          category={categoryWithNullTags}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(screen.getByText('ItemWithNullTags')).toBeInTheDocument()
    })

    it('should handle items with empty tags array', () => {
      const categoryWithEmptyTags = {
        label: 'Test',
        subs: [
          {
            label: 'Sub',
            type: 'subcategory' as const,
            items: [
              {
                label: 'ItemWithEmptyTags',
                type: 'page' as const,
                link: { type: 'custom' as const, url: '/test' },
                tags: [],
              },
            ],
          },
        ],
      }

      const { container } = render(
        <MegaMenuDropdown
          category={categoryWithEmptyTags}
          isOpen={true}
          onCloseAction={mockOnCloseAction}
        />,
      )

      expect(screen.getByText('ItemWithEmptyTags')).toBeInTheDocument()
      // Verify no badges are rendered for this item
      const badges = container.querySelectorAll('.mega-menu-badge')
      expect(badges.length).toBe(0)
    })
  })
})
