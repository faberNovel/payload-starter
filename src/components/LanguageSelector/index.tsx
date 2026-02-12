'use client'

import type { LocaleCode } from '@/i18n/locales'
import { DEFAULT_LOCALE, DEFAULT_LOCALE_LABELS, LOCALE_CODES } from '@/i18n/locales'
import type { Language, Media as MediaType } from '@/payload-types'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

type LanguageEntry = NonNullable<Language['languages']>[number]

interface LanguageSelectorProps {
  /** Languages from the Payload global (may be undefined if not yet configured). */
  languages?: Language['languages']
  /** The currently active locale derived from the URL. */
  currentLocale: LocaleCode
}

/**
 * Build the localised path by swapping the leading /xx segment,
 * or prepending one when switching away from the default locale.
 */
function buildLocalePath(pathname: string, targetLocale: LocaleCode): string {
  const segments = pathname.split('/').filter(Boolean)
  const codes: readonly string[] = LOCALE_CODES

  // If the first segment is a known locale, replace it
  if (segments.length > 0 && codes.includes(segments[0])) {
    if (targetLocale === DEFAULT_LOCALE) {
      // Default locale → remove prefix
      segments.shift()
      return '/' + segments.join('/')
    }
    segments[0] = targetLocale
    return '/' + segments.join('/')
  }

  // No locale prefix present
  if (targetLocale === DEFAULT_LOCALE) return pathname
  return `/${targetLocale}${pathname}`
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ languages, currentLocale }) => {
  const pathname = usePathname()
  const router = useRouter()

  // Merge Payload global data with fallback defaults
  const items: { code: LocaleCode; label: string; flagUrl?: string }[] = languages?.length
    ? languages.map((lang: LanguageEntry) => ({
        code: lang.code as LocaleCode,
        label: lang.label,
        flagUrl:
          lang.flag && typeof lang.flag === 'object' ? (lang.flag as MediaType).url : undefined,
      }))
    : LOCALE_CODES.map((code) => ({
        code,
        label: DEFAULT_LOCALE_LABELS[code],
      }))

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value as LocaleCode
    router.push(buildLocalePath(pathname, locale))
  }

  return (
    <select
      className="bg-transparent border border-border rounded px-2 py-1 text-sm cursor-pointer"
      value={currentLocale}
      onChange={handleChange}
      aria-label="Select language"
    >
      {items.map(({ code, label, flagUrl }) => (
        <option key={code} value={code}>
          {flagUrl ? `🏳️ ${label}` : label}
        </option>
      ))}
    </select>
  )
}
