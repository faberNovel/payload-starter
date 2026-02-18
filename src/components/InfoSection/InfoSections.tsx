import React from 'react'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { InfoSectionRenderer } from './InfoSectionRenderer'

export const InfoSections: React.FC = async () => {
  const payload = await getPayload({ config: configPromise })

  const { docs: sections } = await payload.find({
    collection: 'infoSection',
    limit: 100,
    sort: 'createdAt',
    pagination: false,
  })

  if (!sections.length) return null

  return (
    <div className="container py-16">
      <div className="flex flex-col gap-16">
        {sections.map((section) => (
          <InfoSectionRenderer key={section.id} section={section} />
        ))}
      </div>
    </div>
  )
}
