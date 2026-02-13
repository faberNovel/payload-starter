import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'headerType',
      type: 'radio',
      label: 'Header Type',
      defaultValue: 'standard',
      options: [
        {
          label: 'Standard Header',
          value: 'standard',
        },
        {
          label: 'Mega Header',
          value: 'mega',
        },
      ],
      admin: {
        description: 'Choose which header style to display on the website',
        layout: 'horizontal',
      },
    },
    {
      name: 'description',
      type: 'text',
      label: 'Site Description',
      admin: {
        description: 'Optional site description for SEO',
      },
    },
  ],
}