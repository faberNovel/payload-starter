import { describe, expect, it } from 'vitest'
import { InfoSection } from './InfoSection'

describe('InfoSection Collection Config', () => {
  describe('Collection Properties', () => {
    it('should have the correct slug', () => {
      expect(InfoSection.slug).toBe('infoSection')
    })

    it('should have timestamps enabled', () => {
      expect(InfoSection.timestamps).toBe(true)
    })

    it('should use title as the admin display field', () => {
      expect(InfoSection.admin?.useAsTitle).toBe('title')
    })

    it('should show title in default columns', () => {
      expect(InfoSection.admin?.defaultColumns).toContain('title')
    })
  })

  describe('Access Control', () => {
    it('should have access control for all operations', () => {
      expect(InfoSection.access).toBeDefined()
      expect(InfoSection.access?.admin).toBeDefined()
      expect(InfoSection.access?.create).toBeDefined()
      expect(InfoSection.access?.delete).toBeDefined()
      expect(InfoSection.access?.read).toBeDefined()
      expect(InfoSection.access?.update).toBeDefined()
    })
  })

  describe('Fields', () => {
    const fields = InfoSection.fields

    it('should have title, content, and subcontentdropdown fields', () => {
      const fieldNames = fields.map((f: any) => f.name)
      expect(fieldNames).toContain('title')
      expect(fieldNames).toContain('content')
      expect(fieldNames).toContain('subcontentdropdown')
    })

    describe('Title field', () => {
      const titleField = fields.find((f: any) => f.name === 'title') as any

      it('should be a text field', () => {
        expect(titleField.type).toBe('text')
      })

      it('should be required', () => {
        expect(titleField.required).toBe(true)
      })
    })

    describe('Content field', () => {
      const contentField = fields.find((f: any) => f.name === 'content') as any

      it('should be a richText field', () => {
        expect(contentField.type).toBe('richText')
      })

      it('should be required', () => {
        expect(contentField.required).toBe(true)
      })

      it('should have a custom editor', () => {
        expect(contentField.editor).toBeDefined()
      })
    })

    describe('Subcontentdropdown field', () => {
      const subcontentField = fields.find((f: any) => f.name === 'subcontentdropdown') as any

      it('should be an array field', () => {
        expect(subcontentField.type).toBe('array')
      })

      it('should not be required', () => {
        expect(subcontentField.required).toBeUndefined()
      })

      it('should have label and subcontent subfields', () => {
        const subFieldNames = subcontentField.fields.map((f: any) => f.name)
        expect(subFieldNames).toContain('label')
        expect(subFieldNames).toContain('subcontent')
      })

      describe('Label subfield', () => {
        const labelField = subcontentField.fields.find((f: any) => f.name === 'label')

        it('should be a text field', () => {
          expect(labelField.type).toBe('text')
        })

        it('should be required', () => {
          expect(labelField.required).toBe(true)
        })
      })

      describe('Subcontent subfield', () => {
        const subcontentSubfield = subcontentField.fields.find((f: any) => f.name === 'subcontent')

        it('should be a richText field', () => {
          expect(subcontentSubfield.type).toBe('richText')
        })

        it('should be required', () => {
          expect(subcontentSubfield.required).toBe(true)
        })

        it('should have a custom editor', () => {
          expect(subcontentSubfield.editor).toBeDefined()
        })
      })
    })
  })
})
