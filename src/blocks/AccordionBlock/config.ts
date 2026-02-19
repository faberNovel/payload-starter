import type { Block } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'

export const AccordionBlock: Block = {
  slug: 'accordionBlock',
  interfaceName: 'AccordionBlock',
  labels: {
    singular: 'Accordion',
    plural: 'Accordions',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading',
      localized: true,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Items',
      minRows: 1,
      maxRows: 20,
      labels: {
        singular: 'Item',
        plural: 'Items',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          required: true,
          localized: true,
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Content',
          editor: defaultLexical,
          localized: true,
        },
      ],
    },
  ],
}
