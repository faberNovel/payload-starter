import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    ignores: [
      // Build outputs
      '.next/**',
      'dist/**',
      'build/**',
      'out/**',

      // Dependencies
      'node_modules/**',

      // Payload
      '.payload/**',

      // Cache and temp files
      '.cache/**',
      '.turbo/**',
      '.vercel/**',
      '.swc/**',

      // Public assets
      'public/**',

      // Test coverage
      'coverage/**',

      // Docker
      '.docker/**',

      // Generated files
      '**/payload-types.ts',
      '**/importMap.js',

      // Specific config files
      'next.config.js',
      'postcss.config.js',
      'tailwind.config.mjs',
      'vitest.config.mts',
      'next-sitemap.config.cjs',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
]

export default eslintConfig
