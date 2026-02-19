import type { Block } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'

export const CarouselBlock: Block = {
  slug: 'carouselBlock',
  interfaceName: 'CarouselBlock',
  fields: [
    {
      name: 'slides',
      type: 'array',
      label: 'Slides',
      minRows: 1,
      maxRows: 10,
      fields: [
        {
          name: 'headline',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'content',
          type: 'richText',
          editor: defaultLexical,
          localized: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Button Label',
          localized: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'Button URL',
          admin: {
            condition: (data, siblingData) => Boolean(siblingData?.label),
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
        },
      ],
    },
  ],
  labels: {
    singular: 'Carousel',
    plural: 'Carousels',
  },
}
