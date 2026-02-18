'use client'

import { cn } from '@/utilities/ui'
import React, { useState } from 'react'

interface AccordionItem {
  id: string
  label: string
  children: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const isOpen = openItems.has(item.id)

        return (
          <div
            key={item.id}
            className={cn(
              'overflow-hidden rounded-lg border transition-colors duration-200',
              isOpen ? 'border-[#F5C518]' : 'border-border hover:border-[#F5C518]',
            )}
          >
            {/* Accordion header */}
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className={cn(
                'flex w-full items-center gap-3 px-6 py-4 text-left font-semibold transition-colors duration-200',
                isOpen ? 'bg-[#F5C518] text-black' : 'bg-background hover:bg-[#F5C518]/15',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-xs font-bold transition-transform duration-200',
                  isOpen ? 'text-black' : 'text-foreground',
                )}
                aria-hidden
              >
                {isOpen ? '−' : '+'}
              </span>
              <span>{item.label}</span>
            </button>

            {/* Accordion content */}
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-in-out',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="px-6 py-5 info-section-accordion-content">{item.children}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
