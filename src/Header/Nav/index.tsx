'use client'

import React from 'react'

import type { Header as HeaderType, MegaHeader as MegaHeaderType, SiteSettings } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

interface HeaderNavProps {
  data: HeaderType | MegaHeaderType
  headerType?: SiteSettings['headerType']
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, headerType }) => {
  const navItems = data?.navItems || []
  
  // Style différent selon le type de header
  const navClass = headerType === 'mega' 
    ? "flex gap-4 items-center mega-nav-style" 
    : "flex gap-3 items-center"

  return (
    <nav className={navClass}>
      {navItems.map(({ link }, i) => {
        const linkAppearance = headerType === 'mega' ? 'mega-link' : 'link'
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      {headerType === 'mega' && (
        <div className="mega-nav-extra text-sm px-2 py-1 bg-blue-100 rounded">
          Mega
        </div>
      )}
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
