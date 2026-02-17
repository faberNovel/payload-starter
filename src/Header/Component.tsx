import { getCachedGlobal } from '@/utilities/getGlobals'
import { HeaderClient } from './Component.client'

import type { Header, Language } from '@/payload-types'

export async function Header() {
  const headerData = (await getCachedGlobal('header', 1)()) as Header
  const languagesData = (await getCachedGlobal('languages', 1)()) as Language

  return <HeaderClient data={headerData} languages={languagesData?.languages} />
}
