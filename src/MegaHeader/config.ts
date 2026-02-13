import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateMegaHeader } from './hooks/revalidateMegaHeader'

export const MegaHeader: GlobalConfig = {
  slug: 'mega-header',
  label: 'Mega Header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/MegaHeader/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateMegaHeader],
  },
}