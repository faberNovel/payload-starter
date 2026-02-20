import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'
import type {
  SerializedEditorState,
  SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

/**
 * Checks whether a value looks like Lexical richText data.
 */
function isLexicalData(value: unknown): value is SerializedEditorState<SerializedLexicalNode> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'root' in value &&
    typeof (value as any).root === 'object' &&
    'type' in (value as any).root
  )
}

/**
 * Recursively walks any value and extracts plain text from every Lexical richText
 * field it encounters. Works with any block type or nesting depth — no manual
 * registration needed.
 */
function collectRichText(value: unknown, parts: string[]): void {
  if (value == null || typeof value !== 'object') return

  if (isLexicalData(value)) {
    const text = convertLexicalToPlaintext({ data: value })
    if (text) parts.push(text)
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectRichText(item, parts)
    }
    return
  }

  for (const key of Object.keys(value as Record<string, unknown>)) {
    collectRichText((value as Record<string, unknown>)[key], parts)
  }
}

/**
 * Extracts plain text from all richText fields found in layout blocks.
 */
function extractBlocksPlaintext(layout: unknown): string {
  if (!Array.isArray(layout)) return ''

  const parts: string[] = []
  collectRichText(layout, parts)
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
