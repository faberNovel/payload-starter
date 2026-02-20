import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

/**
 * Maps each block type to its array field and the richText sub-field within each item.
 * To support a new block, just add an entry here.
 */
const BLOCK_RICHTEXT_PATHS: Record<string, { arrayField: string; richTextField: string }> = {
  carouselBlock: { arrayField: 'slides', richTextField: 'content' },
  accordionBlock: { arrayField: 'items', richTextField: 'content' },
  content: { arrayField: 'columns', richTextField: 'richText' },
}

/**
 * Extracts plain text from all richText fields found in layout blocks.
 */
function extractBlocksPlaintext(layout: any[]): string {
  if (!Array.isArray(layout)) return ''

  const parts: string[] = []

  for (const block of layout) {
    if (!block) continue

    const path = BLOCK_RICHTEXT_PATHS[block.blockType]
    if (!path) continue

    const items = block[path.arrayField]
    if (!Array.isArray(items)) continue

    for (const item of items) {
      const richText = item?.[path.richTextField]
      if (!richText) continue

      const text = convertLexicalToPlaintext({ data: richText })
      if (text) parts.push(text)
    }
  }

  return parts.join(' ').trim()
}

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta, layout } = originalDoc

  // Extract plain text from richText fields in layout blocks
  const contentBody = extractBlocksPlaintext(layout)

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    categories: [],
    contentBody,
  }

  if (categories && Array.isArray(categories) && categories.length > 0) {
    const populatedCategories: { id: string | number; title: string }[] = []
    for (const category of categories) {
      if (!category) {
        continue
      }

      if (typeof category === 'object') {
        populatedCategories.push(category)
        continue
      }

      const doc = await req.payload.findByID({
        collection: 'categories',
        id: category,
        disableErrors: true,
        depth: 0,
        select: { title: true },
        req,
      })

      if (doc !== null) {
        populatedCategories.push(doc)
      } else {
        console.error(
          `Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`,
        )
      }
    }

    modifiedDoc.categories = populatedCategories.map((each) => ({
      relationTo: 'categories',
      categoryID: String(each.id),
      title: each.title,
    }))
  }

  return modifiedDoc
}
