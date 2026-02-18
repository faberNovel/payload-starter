import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Accordion } from './Accordion'

afterEach(() => {
  cleanup()
})

const mockItems = [
  { id: 'item-1', label: 'First item', children: <p>First content</p> },
  { id: 'item-2', label: 'Second item', children: <p>Second content</p> },
  { id: 'item-3', label: 'Third item', children: <p>Third content</p> },
]

describe('Accordion', () => {
  describe('Rendering', () => {
    it('should render all items', () => {
      render(<Accordion items={mockItems} />)

      expect(screen.getByText('First item')).toBeInTheDocument()
      expect(screen.getByText('Second item')).toBeInTheDocument()
      expect(screen.getByText('Third item')).toBeInTheDocument()
    })

    it('should render content for each item', () => {
      render(<Accordion items={mockItems} />)

      expect(screen.getByText('First content')).toBeInTheDocument()
      expect(screen.getByText('Second content')).toBeInTheDocument()
      expect(screen.getByText('Third content')).toBeInTheDocument()
    })

    it('should render nothing when items is empty', () => {
      const { container } = render(<Accordion items={[]} />)
      const buttons = container.querySelectorAll('button')
      expect(buttons).toHaveLength(0)
    })

    it('should render a button for each item', () => {
      const { container } = render(<Accordion items={mockItems} />)
      const buttons = container.querySelectorAll('button')
      expect(buttons).toHaveLength(3)
    })
  })

  describe('Expand/Collapse', () => {
    it('should start with all items collapsed', () => {
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('should show + icon when collapsed', () => {
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        const icon = button.querySelector('[aria-hidden]')
        expect(icon).toHaveTextContent('+')
      })
    })

    it('should expand an item when clicked', () => {
      render(<Accordion items={mockItems} />)

      const firstButton = screen.getByText('First item').closest('button')!
      fireEvent.click(firstButton)

      expect(firstButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should show − icon when expanded', () => {
      render(<Accordion items={mockItems} />)

      const firstButton = screen.getByText('First item').closest('button')!
      fireEvent.click(firstButton)

      const icon = firstButton.querySelector('[aria-hidden]')
      expect(icon).toHaveTextContent('−')
    })

    it('should collapse an expanded item when clicked again', () => {
      render(<Accordion items={mockItems} />)

      const firstButton = screen.getByText('First item').closest('button')!
      fireEvent.click(firstButton)
      expect(firstButton).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(firstButton)
      expect(firstButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should allow multiple items to be open simultaneously', () => {
      render(<Accordion items={mockItems} />)

      const firstButton = screen.getByText('First item').closest('button')!
      const secondButton = screen.getByText('Second item').closest('button')!

      fireEvent.click(firstButton)
      fireEvent.click(secondButton)

      expect(firstButton).toHaveAttribute('aria-expanded', 'true')
      expect(secondButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should not collapse other items when opening a new one', () => {
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
      fireEvent.click(buttons[1])
      fireEvent.click(buttons[2])

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-expanded', 'true')
      })
    })
  })

  describe('Styling', () => {
    it('should apply yellow background when expanded', () => {
      const { container } = render(<Accordion items={mockItems} />)

      const firstButton = container.querySelectorAll('button')[0]
      fireEvent.click(firstButton)

      expect(firstButton).toHaveClass('bg-[#F5C518]')
      expect(firstButton).toHaveClass('text-black')
    })

    it('should apply default background when collapsed', () => {
      const { container } = render(<Accordion items={mockItems} />)

      const firstButton = container.querySelectorAll('button')[0]
      expect(firstButton).toHaveClass('bg-background')
    })

    it('should apply yellow border when expanded', () => {
      const { container } = render(<Accordion items={mockItems} />)

      const firstButton = container.querySelectorAll('button')[0]
      const wrapper = firstButton.closest('.overflow-hidden')!

      fireEvent.click(firstButton)
      expect(wrapper).toHaveClass('border-[#F5C518]')
    })

    it('should apply default border when collapsed', () => {
      const { container } = render(<Accordion items={mockItems} />)

      const firstButton = container.querySelectorAll('button')[0]
      const wrapper = firstButton.closest('.overflow-hidden')!

      expect(wrapper).toHaveClass('border-border')
    })

    it('should apply info-section-accordion-content class to content wrapper', () => {
      const { container } = render(<Accordion items={mockItems} />)

      const contentWrappers = container.querySelectorAll('.info-section-accordion-content')
      expect(contentWrappers).toHaveLength(3)
    })

    it('should apply grid-rows animation classes', () => {
      const { container } = render(<Accordion items={mockItems} />)

      const firstButton = container.querySelectorAll('button')[0]
      const wrapper = firstButton.closest('.overflow-hidden')!
      const gridContainer = wrapper.querySelector('.grid')!

      // Collapsed: grid-rows-[0fr]
      expect(gridContainer).toHaveClass('grid-rows-[0fr]')

      // Expand
      fireEvent.click(firstButton)
      expect(gridContainer).toHaveClass('grid-rows-[1fr]')
    })
  })
})
