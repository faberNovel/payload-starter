import React from 'react'

import type { InfoSection } from '@/payload-types'

import RichText from '@/components/RichText'
import { Accordion } from './Accordion'

interface InfoSectionRendererProps {
  section: InfoSection
  className?: string
}

export const InfoSectionRenderer: React.FC<InfoSectionRendererProps> = ({ section, className }) => {
  const accordionItems =
    section.subcontentdropdown?.map((item) => ({
      id: item.id ?? item.label,
      label: item.label,
      children: <RichText data={item.subcontent} enableGutter={false} />,
    })) ?? []

  return (
    <section className={className}>
      <h2 className="mb-6 text-3xl font-bold">{section.title}</h2>

      <div className="info-section-content mb-8">
        <RichText data={section.content} enableGutter={false} />
      </div>

      {accordionItems.length > 0 && <Accordion items={accordionItems} />}
    </section>
  )
}
