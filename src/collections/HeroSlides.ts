import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const HeroSlides: CollectionConfig = {
  slug: 'heroSlides',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['headline'],
    useAsTitle: 'headline',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Button label',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'Custom URL',
          required: true,
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Image displayed next to the slide',
      },
    },
  ],
  timestamps: true,
}
