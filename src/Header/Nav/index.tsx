'use client'

import React, { useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { MegaMenuDropdown } from '@/components/MegaMenu/MegaMenuDropdown'
import { ChevronDown, ChevronUp, SearchIcon } from 'lucide-react'
import Link from 'next/link'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const navCategories = data?.navCategories || []
  const [openCategory, setOpenCategory] = useState<number | null>(null)

  // Check if mega menu is configured
  const hasMegaMenu = navCategories.length > 0

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index)
  }

  const closeMenu = () => {
    setOpenCategory(null)
  }

  return (
    <nav className="flex gap-3 items-center">
      {hasMegaMenu ? (
        <>
          {navCategories.map((category, index) => {
            const isOpen = openCategory === index
            return (
              <div key={index}>
                <button
                  onClick={() => toggleCategory(index)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                >
                  {category.label}
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <MegaMenuDropdown category={category} isOpen={isOpen} onCloseAction={closeMenu} />
                )}
              </div>
            )
          })}
        </>
      ) : (
        <>
          {navItems.map(({ link }, i) => {
            return <CMSLink key={i} {...link} appearance="link" />
          })}
        </>
      )}

      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
