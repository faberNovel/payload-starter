import type { Field, GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
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
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'navCategories',
      label: 'Mega Menu Categories',
      type: 'array',
      admin: {
        description: 'Define navigation categories with dropdown mega menu. Leave empty to use standard navigation.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Category name (e.g., "Formations", "Admission")',
          },
        },
        {
          name: 'subs',
          label: 'Subcategories',
          type: 'array',
          admin: {
            description: 'Subcategories and direct pages for this category',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: {
                description: 'Subcategory name (e.g., "Domaines de formation")',
              },
            },
            {
              name: 'type',
              type: 'select',
              defaultValue: 'subcategory',
              options: [
                {
                  label: 'Subcategory (has pages)',
                  value: 'subcategory',
                },
                {
                  label: 'Direct Link',
                  value: 'link',
                },
              ],
              admin: {
                description: 'Choose if this is a subcategory with pages or a direct link',
              },
            },
            ({
              ...link({
                appearances: false,
                disableLabel: true,
              }),
              admin: {
                condition: (_data: Record<string, unknown>, siblingData: Record<string, unknown>) => siblingData?.type === 'link',
                description: 'Link URL (only for direct links)',
              },
            } as unknown as Field),
            {
              name: 'subSubs',
              label: 'Sub-subcategories',
              type: 'array',
              admin: {
                condition: (_data: Record<string, unknown>, siblingData: Record<string, unknown>) => siblingData?.type === 'subcategory',
                description: 'Sub-subcategories with their own pages',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Sub-subcategory name',
                  },
                },
                {
                  name: 'items',
                  label: 'Pages',
                  type: 'array',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                    },
                    link({
                      appearances: false,
                      disableLabel: true,
                    }),
                    {
                      name: 'tags',
                      label: 'Badges',
                      type: 'array',
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          required: true,
                        },
                        {
                          name: 'style',
                          type: 'select',
                          defaultValue: 'default',
                          options: [
                            { label: 'Default', value: 'default' },
                            { label: 'Primary', value: 'primary' },
                            { label: 'Secondary', value: 'secondary' },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'items',
              label: 'Pages',
              type: 'array',
              admin: {
                condition: (_data: Record<string, unknown>, siblingData: Record<string, unknown>) => siblingData?.type === 'subcategory',
                description: 'Pages and nested subcategories',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'type',
                  type: 'select',
                  defaultValue: 'page',
                  options: [
                    {
                      label: 'Page',
                      value: 'page',
                    },
                    {
                      label: 'Nested Subcategory',
                      value: 'nested',
                    },
                  ],
                },
                ({
                  ...link({
                    appearances: false,
                    disableLabel: true,
                  }),
                  admin: {
                    condition: (_data: Record<string, unknown>, siblingData: Record<string, unknown>) => siblingData?.type === 'page',
                  },
                } as unknown as Field),
                {
                  name: 'tags',
                  label: 'Badges',
                  type: 'array',
                  admin: {
                    condition: (_data: Record<string, unknown>, siblingData: Record<string, unknown>) => siblingData?.type === 'page',
                    description: 'Optional badges (e.g., "BAC+3", "Alternance")',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'style',
                      type: 'select',
                      defaultValue: 'default',
                      options: [
                        { label: 'Default', value: 'default' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                    },
                  ],
                },
                {
                  name: 'nestedItems',
                  label: 'Nested Pages',
                  type: 'array',
                  admin: {
                    condition: (_data: Record<string, unknown>, siblingData: Record<string, unknown>) => siblingData?.type === 'nested',
                    description: 'Pages within this nested subcategory',
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                    },
                    link({
                      appearances: false,
                      disableLabel: true,
                    }),
                    {
                      name: 'tags',
                      label: 'Badges',
                      type: 'array',
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          required: true,
                        },
                        {
                          name: 'style',
                          type: 'select',
                          defaultValue: 'default',
                          options: [
                            { label: 'Default', value: 'default' },
                            { label: 'Primary', value: 'primary' },
                            { label: 'Secondary', value: 'secondary' },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
