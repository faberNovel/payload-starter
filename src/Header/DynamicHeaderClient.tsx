'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, MegaHeader, SiteSettings } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface DynamicHeaderClientProps {
  headerType: SiteSettings['headerType']
  standardHeader?: Header
  megaHeader?: MegaHeader
}

export const DynamicHeaderClient: React.FC<DynamicHeaderClientProps> = ({ 
  headerType, 
  standardHeader, 
  megaHeader 
}) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const activeHeaderData = headerType === 'mega' ? megaHeader : standardHeader
  
  const headerClass = headerType === 'mega' 
    ? "container relative z-20 mega-header-style" 
    : "container relative z-20"

  return (
    <header className={headerClass} {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between">
        <Link href="/">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>
        {activeHeaderData && (
          <HeaderNav data={activeHeaderData} headerType={headerType} />
        )}
      </div>
    </header>
  )
}