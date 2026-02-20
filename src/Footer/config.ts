import type { GlobalConfig } from 'payload'

import { defaultLexical } from '@/fields/defaultLexical'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    // ─── TOP BLOCK (optional) ────────────────────────────────────────────────
    {
      name: 'topBlock',
      type: 'group',
      label: 'Top Block',
      admin: {
        description: 'Optional top band: branding (left) + social networks (right).',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable top block',
          defaultValue: false,
        },
        // ── Left: slogan + partner logos ──────────────────────────────────────
        {
          name: 'slogan',
          type: 'richText',
          label: 'Slogan',
          editor: defaultLexical,
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'partnerLogos',
          type: 'array',
          label: 'Partner Logos',
          maxRows: 10,
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.enabled),
          },
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Logo image',
            },
            {
              name: 'alt',
              type: 'text',
              label: 'Alt text',
            },
            {
              name: 'url',
              type: 'text',
              label: 'Link URL (optional)',
              admin: { placeholder: 'https://' },
            },
          ],
        },
        // ── Right: social networks ────────────────────────────────────────────
        {
          name: 'socialNetworksTitle',
          type: 'text',
          label: 'Social Networks Title',
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.enabled),
            placeholder: 'Follow us on social media',
          },
        },
        {
          name: 'socialNetworks',
          type: 'array',
          label: 'Social Networks',
          maxRows: 10,
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.enabled),
          },
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              label: 'Platform',
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'X (Twitter)', value: 'twitter' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'TikTok', value: 'tiktok' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'Profile URL',
            },
            {
              name: 'label',
              type: 'text',
              label: 'Accessible label (aria-label)',
              admin: { placeholder: 'Follow us on Facebook' },
            },
          ],
        },
      ],
    },

    // ─── BOTTOM BLOCK: navigation columns ────────────────────────────────────
    {
      name: 'columns',
      type: 'array',
      label: 'Navigation Columns (max 5)',
      maxRows: 5,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Column Title',
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Column Content',
          editor: defaultLexical,
        },
      ],
    },

    // ─── LEGAL BAR: bottom legal links ───────────────────────────────────────
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal Links (bottom bar)',
      admin: {
        description: 'Links or text separated by dashes (e.g., Privacy Policy, Terms, etc.)',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label',
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL (optional - leave empty for plain text)',
          admin: { placeholder: 'https://...' },
        },
        {
          name: 'newTab',
          type: 'checkbox',
          label: 'Open in new tab',
          defaultValue: false,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
