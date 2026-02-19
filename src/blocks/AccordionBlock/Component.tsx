'use client'

import React, { useRef, useState } from 'react'
import type { AccordionBlock as AccordionBlockType } from '@/payload-types'
import RichText from '@/components/RichText'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { cn } from '@/utilities/ui'

type Props = AccordionBlockType & {
  disableInnerContainer?: boolean
}

type AccordionItem = NonNullable<AccordionBlockType['items']>[number]

type AccordionItemProps = {
  title: string
  content?: AccordionItem['content']
  index: number
}

function AccordionItem({ title, content, index }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const toggle = () => setIsOpen((prev) => !prev)

  return (
    <div
      className={cn(
        'border-2 border-border rounded-lg mb-[1.875rem] shadow-[0_2px_6px_0_rgba(0,0,0,0.15)]',
        'transition-all duration-300',
      )}
    >
      {/* Title / trigger */}
      <h3 className="mb-0 relative cursor-pointer transition-all duration-300 text-[1.125rem]">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`accordion-content-${index}`}
          id={`accordion-title-${index}`}
          onClick={toggle}
          className={cn(
            'flex w-full items-center justify-between gap-4',
            'px-[1.5625rem] py-5 text-left font-semibold',
            'text-foreground transition-colors duration-300',
            'bg-secondary',
            isOpen && 'text-primary',
          )}
        >
          <div className="flex items-center gap-4">
            {isOpen ? (
              <Minus className={cn('h-5 w-5 text-primary')} aria-hidden="true" />
            ) : (
              <Plus className={cn('h-5 w-5 text-primary')} aria-hidden="true" />
            )}
            <span>{title}</span>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 shrink-0 text-primary transition-transform duration-300',
              isOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </h3>

      {/* Content — transitions via max-height */}
      <div
        id={`accordion-content-${index}`}
        role="region"
        aria-labelledby={`accordion-title-${index}`}
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 9999}px` : '0px',
        }}
      >
        <div className="px-[1.5625rem] py-[1.875rem] text-[0.875rem]">
          {content && <RichText data={content} enableGutter={false} />}
        </div>
      </div>
    </div>
  )
}

export const AccordionBlock: React.FC<Props> = ({ heading, items }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="relative mx-auto w-full max-w-[1400px] px-4 lg:px-8">
      {heading && <h2 className="mb-8 text-2xl font-bold text-foreground">{heading}</h2>}
      <div>
        {items.map((item, index) => (
          <AccordionItem
            key={item.id ?? index}
            index={index}
            title={item.title}
            content={item.content}
          />
        ))}
      </div>
    </div>
  )
}
