import { getPayload } from 'payload'
import config from '@payload-config'
import React, { cache } from 'react'

import type { Header, MegaHeader, SiteSettings } from '@/payload-types'

import { DynamicHeaderClient } from './DynamicHeaderClient'

const getHeaderData = cache(async (): Promise<{
  headerType: SiteSettings['headerType']
  standardHeader: Header | null
  megaHeader: MegaHeader | null
}> => {
  const payload = await getPayload({ config })
  
  try {
    // Récupérer les paramètres du site
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
    })
    
    const headerType = siteSettings?.headerType || 'standard'
    
    // Récupérer les deux headers
    const [standardHeader, megaHeader] = await Promise.all([
      payload.findGlobal({ slug: 'header' }).catch(() => null),
      payload.findGlobal({ slug: 'mega-header' }).catch(() => null),
    ])
    
    return {
      headerType,
      standardHeader,
      megaHeader,
    }
  } catch (error) {
    // Fallback
    const standardHeader = await payload.findGlobal({ slug: 'header' }).catch(() => null)
    
    return {
      headerType: 'standard',
      standardHeader,
      megaHeader: null,
    }
  }
})

export async function DynamicHeader() {
  const { headerType, standardHeader, megaHeader } = await getHeaderData()

  return (
    <DynamicHeaderClient 
      headerType={headerType}
      standardHeader={standardHeader || undefined}
      megaHeader={megaHeader || undefined}
    />
  )
}