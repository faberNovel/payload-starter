import { getPayload } from 'payload'
import config from '@payload-config'

export async function getActiveHeader() {
  const payload = await getPayload({ config })
  
  try {
    // Récupérer les paramètres du site
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
    })
    
    const headerType = siteSettings?.headerType || 'standard'
    
    // Récupérer le header approprié
    if (headerType === 'mega') {
      const megaHeader = await payload.findGlobal({
        slug: 'mega-header',
      })
      return { type: 'mega', data: megaHeader }
    } else {
      const header = await payload.findGlobal({
        slug: 'header',
      })
      return { type: 'standard', data: header }
    }
  } catch (error) {
    // Fallback vers le header standard en cas d'erreur
    const header = await payload.findGlobal({
      slug: 'header',
    })
    return { type: 'standard', data: header }
  }
}