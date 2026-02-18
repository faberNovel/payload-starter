import type { CollectionConfig } from 'payload'

import {
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  EXPERIMENTAL_TableFeature as TableFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { authenticated } from '../access/authenticated'

const infoSectionEditor = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    LinkFeature(),
    TableFeature(),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

export const InfoSection: CollectionConfig = {
  slug: 'infoSection',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
      editor: infoSectionEditor,
    },
    {
      name: 'subcontentdropdown',
      label: 'Subcontent Dropdown',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
        },
        {
          name: 'subcontent',
          type: 'richText',
          label: 'Subcontent',
          required: true,
          editor: infoSectionEditor,
        },
      ],
    },
  ],
  timestamps: true,
}
