import type { GlobalConfig } from 'payload'

import { DEFAULT_LOCALE_LABELS, LOCALE_CODES } from '@/i18n/locales'
import { revalidateLanguages } from './hooks/revalidateLanguages'

export const Languages: GlobalConfig = {
  slug: 'languages',
  label: 'Languages',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'languages',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description:
          'Manage display metadata for each locale. The locale codes must match the ones defined in the Payload config.',
        initCollapsed: true,
      },
      defaultValue: LOCALE_CODES.map((code) => ({
        code,
        label: DEFAULT_LOCALE_LABELS[code],
        isDefault: code === 'en',
      })),
      fields: [
        {
          name: 'code',
          type: 'select',
          required: true,
          options: LOCALE_CODES.map((code) => ({
            label: DEFAULT_LOCALE_LABELS[code],
            value: code,
          })),
          admin: {
            description: 'Must match a locale defined in payload.config.ts',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Display name shown in the language selector (e.g. "English", "Français")',
          },
        },
        {
          name: 'flag',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Optional flag or icon displayed next to the language name',
          },
        },
        {
          name: 'isDefault',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Mark one language as the default',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateLanguages],
  },
}
