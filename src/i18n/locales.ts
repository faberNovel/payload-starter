/**
 * Single source of truth for supported locales.
 *
 * - Used by `payload.config.ts` for the localization engine (data storage).
 * - Used by the frontend for the language selector.
 * - The Languages global in Payload lets admins manage display metadata
 *   (labels, flag images, ordering) without a code change.
 */

export const LOCALE_CODES = ['en', 'fr'] as const

export type LocaleCode = (typeof LOCALE_CODES)[number]

export const DEFAULT_LOCALE: LocaleCode = 'en'

/** Fallback labels used when the Languages global has not been configured yet. */
export const DEFAULT_LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
  fr: 'Français',
}
