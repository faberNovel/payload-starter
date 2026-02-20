import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Footer, Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

// ─── Social icon SVG map ───────────────────────────────────────────────────────

type SocialPlatform = 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok'

const SocialIcon = ({ platform }: { platform: SocialPlatform }) => {
  switch (platform) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
          <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
          <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      )
    default:
      return null
  }
}

// ─── Footer component ──────────────────────────────────────────────────────────

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const { topBlock, columns, legalLinks } = footerData
  const hasTopBlock = topBlock?.enabled
  const hasColumns = Array.isArray(columns) && columns.length > 0
  const hasLegalLinks = Array.isArray(legalLinks) && legalLinks.length > 0

  return (
    <footer role="contentinfo" className="mt-auto bg-neutral-900 text-white">
      {/* ── Top block ─────────────────────────────────────────────────────── */}
      {hasTopBlock && (
        <div className="border-b border-neutral-700">
          <div className="container py-10">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {/* Left: slogan + partner logos */}
              <div className="flex flex-col gap-6">
                {topBlock?.slogan && (
                  <div className="text-base leading-relaxed text-neutral-300 [&_p]:text-neutral-300 [&_strong]:text-white">
                    <RichText data={topBlock.slogan} enableGutter={false} />
                  </div>
                )}

                {Array.isArray(topBlock?.partnerLogos) && topBlock.partnerLogos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-6">
                    {topBlock.partnerLogos.map((item, i) => {
                      const logoMedia =
                        typeof item.logo === 'object' ? (item.logo as MediaType) : null
                      if (!logoMedia) return null

                      const imgEl = (
                        <Media
                          key={i}
                          resource={item.logo}
                          imgClassName="h-12 w-auto object-contain brightness-0 invert"
                          alt={item.alt ?? logoMedia.alt ?? ''}
                        />
                      )

                      return item.url ? (
                        <a
                          key={i}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {imgEl}
                        </a>
                      ) : (
                        <div key={i}>{imgEl}</div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Right: social networks */}
              <div className="flex flex-col gap-4 md:items-end">
                {topBlock?.socialNetworksTitle && (
                  <p className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                    {topBlock.socialNetworksTitle}
                  </p>
                )}

                {Array.isArray(topBlock?.socialNetworks) && topBlock.socialNetworks.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {topBlock.socialNetworks.map((social, i) => (
                      <a
                        key={i}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label ?? social.platform}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-600 text-white transition-colors hover:border-white hover:bg-white hover:text-neutral-900"
                      >
                        <SocialIcon platform={social.platform} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom block: navigation columns ──────────────────────────────── */}
      {hasColumns && (
        <div className="container py-10">
          <div
            className={`grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${columns.length}`}
          >
            {columns.map((col, i) => (
              <div key={col.id ?? i} className="flex flex-col gap-3">
                {col.title && (
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    {col.title}
                  </h2>
                )}
                {col.content && (
                  <div className="text-sm text-neutral-400 [&_ul]:list-none [&_ul]:space-y-2 [&_li]:flex [&_li]:items-center [&_li]:gap-2 [&_li]:before:content-['•'] [&_li]:before:text-neutral-600 [&_li]:before:flex [&_li]:before:items-center [&_a]:block [&_a]:py-1 [&_a]:text-neutral-400 [&_a]:transition-colors [&_a:hover]:text-white [&_a]:leading-relaxed">
                    <RichText data={col.content} enableGutter={false} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Legal bar: bottom links ────────────────────────────────────────── */}
      {hasLegalLinks && (
        <div className="border-t border-neutral-800 bg-black">
          <div className="container py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-neutral-500">
              {legalLinks!.map((item, i) => (
                <React.Fragment key={item.id ?? i}>
                  {i > 0 && <span aria-hidden="true">-</span>}
                  {item.url ? (
                    <a
                      href={item.url}
                      target={item.newTab ? '_blank' : undefined}
                      rel={item.newTab ? 'noopener noreferrer' : undefined}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
