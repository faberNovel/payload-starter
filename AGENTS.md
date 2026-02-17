# Payload CMS Development Rules

You are an expert Payload CMS developer. When working with Payload projects, follow these rules:

## Core Principles

1. **TypeScript-First**: Always use TypeScript with proper types from Payload
2. **Security-Critical**: Follow all security patterns, especially access control
3. **Type Generation**: Run `generate:types` script after schema changes
4. **Transaction Safety**: Always pass `req` to nested operations in hooks
5. **Access Control**: Understand Local API bypasses access control by default
6. **Access Control**: Ensure roles exist when modifiyng collection or globals with access controls

### Code Validation

- To validate typescript correctness after modifying code run `tsc --noEmit`
- Generate import maps after creating or modifying components.

## Project Structure

```md
src/
├── app/
│ ├── (frontend)/ # Frontend routes
│ └── (payload)/ # Payload admin routes
├── collections/ # Collection configs
├── globals/ # Global configs
├── components/ # Custom React components
├── hooks/ # Hook functions
├── access/ # Access control functions
└── payload.config.ts # Main config
```

## Configuration

### Minimal Config Pattern

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL,
  }),
})
```

## Collections

### Basic Collection

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'createdAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'content', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
  timestamps: true,
}
```

### Auth Collection with RBAC

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'user'],
      defaultValue: ['user'],
      required: true,
      saveToJWT: true, // Include in JWT for fast access checks
      access: {
        update: ({ req: { user } }) => user?.roles?.includes('admin'),
      },
    },
  ],
}
```

## Fields

### Common Patterns

```typescript
// Auto-generate slugs
import { slugField } from 'payload'
slugField({ fieldToUse: 'title' })

// Relationship with filtering
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
  filterOptions: { active: { equals: true } },
}

// Conditional field
{
  name: 'featuredImage',
  type: 'upload',
  relationTo: 'media',
  admin: {
    condition: (data) => data.featured === true,
  },
}

// Virtual field
{
  name: 'fullName',
  type: 'text',
  virtual: true,
  hooks: {
    afterRead: [({ siblingData }) => `${siblingData.firstName} ${siblingData.lastName}`],
  },
}
```

## CRITICAL SECURITY PATTERNS

### 1. Local API Access Control (MOST IMPORTANT)

```typescript
// ❌ SECURITY BUG: Access control bypassed
await payload.find({
  collection: 'posts',
  user: someUser, // Ignored! Operation runs with ADMIN privileges
})

// ✅ SECURE: Enforces user permissions
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // REQUIRED
})

// ✅ Administrative operation (intentional bypass)
await payload.find({
  collection: 'posts',
  // No user, overrideAccess defaults to true
})
```

**Rule**: When passing `user` to Local API, ALWAYS set `overrideAccess: false`

### 2. Transaction Safety in Hooks

```typescript
// ❌ DATA CORRUPTION RISK: Separate transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        // Missing req - runs in separate transaction!
      })
    },
  ],
}

// ✅ ATOMIC: Same transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // Maintains atomicity
      })
    },
  ],
}
```

**Rule**: ALWAYS pass `req` to nested operations in hooks

### 3. Prevent Infinite Hook Loops

```typescript
// ❌ INFINITE LOOP
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        req,
      }) // Triggers afterChange again!
    },
  ],
}

// ✅ SAFE: Use context flag
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return

      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        context: { skipHooks: true },
        req,
      })
    },
  ],
}
```

## Access Control

### Collection-Level Access

```typescript
import type { Access } from 'payload'

// Boolean return
const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Query constraint (row-level security)
const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user?.roles?.includes('admin')) return true

  return {
    author: { equals: user.id },
  }
}

// Async access check
const projectMemberAccess: Access = async ({ req, id }) => {
  const { user, payload } = req

  if (!user) return false
  if (user.roles?.includes('admin')) return true

  const project = await payload.findByID({
    collection: 'projects',
    id: id as string,
    depth: 0,
  })

  return project.members?.includes(user.id)
}
```

### Field-Level Access

```typescript
// Field access ONLY returns boolean (no query constraints)
{
  name: 'salary',
  type: 'number',
  access: {
    read: ({ req: { user }, doc }) => {
      // Self can read own salary
      if (user?.id === doc?.id) return true
      // Admin can read all
      return user?.roles?.includes('admin')
    },
    update: ({ req: { user } }) => {
      // Only admins can update
      return user?.roles?.includes('admin')
    },
  },
}
```

### Common Access Patterns

```typescript
// Anyone
export const anyone: Access = () => true

// Authenticated only
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Admin only
export const adminOnly: Access = ({ req: { user } }) => {
  return user?.roles?.includes('admin')
}

// Admin or self
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  return { id: { equals: user?.id } }
}

// Published or authenticated
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

## Hooks

### Common Hook Patterns

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    // Before validation - format data
    beforeValidate: [
      async ({ data, operation }) => {
        if (operation === 'create') {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],

    // Before save - business logic
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        if (operation === 'update' && data.status === 'published') {
          data.publishedAt = new Date()
        }
        return data
      },
    ],

    // After save - side effects
    afterChange: [
      async ({ doc, req, operation, previousDoc, context }) => {
        // Check context to prevent loops
        if (context.skipNotification) return

        if (operation === 'create') {
          await sendNotification(doc)
        }
        return doc
      },
    ],

    // After read - computed fields
    afterRead: [
      async ({ doc, req }) => {
        doc.viewCount = await getViewCount(doc.id)
        return doc
      },
    ],

    // Before delete - cascading deletes
    beforeDelete: [
      async ({ req, id }) => {
        await req.payload.delete({
          collection: 'comments',
          where: { post: { equals: id } },
          req, // Important for transaction
        })
      },
    ],
  },
}
```

## Queries

### Local API

```typescript
// Find with complex query
const posts = await payload.find({
  collection: 'posts',
  where: {
    and: [{ status: { equals: 'published' } }, { 'author.name': { contains: 'john' } }],
  },
  depth: 2, // Populate relationships
  limit: 10,
  sort: '-createdAt',
  select: {
    title: true,
    author: true,
  },
})

// Find by ID
const post = await payload.findByID({
  collection: 'posts',
  id: '123',
  depth: 2,
})

// Create
const newPost = await payload.create({
  collection: 'posts',
  data: {
    title: 'New Post',
    status: 'draft',
  },
})

// Update
await payload.update({
  collection: 'posts',
  id: '123',
  data: { status: 'published' },
})

// Delete
await payload.delete({
  collection: 'posts',
  id: '123',
})
```

### Query Operators

```typescript
// Equals
{ status: { equals: 'published' } }

// Not equals
{ status: { not_equals: 'draft' } }

// Greater than / less than
{ price: { greater_than: 100 } }
{ age: { less_than_equal: 65 } }

// Contains (case-insensitive)
{ title: { contains: 'payload' } }

// Like (all words present)
{ description: { like: 'cms headless' } }

// In array
{ category: { in: ['tech', 'news'] } }

// Exists
{ image: { exists: true } }

// Near (geospatial)
{ location: { near: [-122.4194, 37.7749, 10000] } }
```

### AND/OR Logic

```typescript
{
  or: [
    { status: { equals: 'published' } },
    { author: { equals: user.id } },
  ],
}

{
  and: [
    { status: { equals: 'published' } },
    { featured: { equals: true } },
  ],
}
```

## Getting Payload Instance

```typescript
// In API routes (Next.js)
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
  })

  return Response.json(posts)
}

// In Server Components
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'posts' })

  return <div>{docs.map(post => <h1 key={post.id}>{post.title}</h1>)}</div>
}
```

## Components

The Admin Panel can be extensively customized using React Components. Custom Components can be Server Components (default) or Client Components.

### Defining Components

Components are defined using **file paths** (not direct imports) in your config:

**Component Path Rules:**

- Paths are relative to project root or `config.admin.importMap.baseDir`
- Named exports: use `#ExportName` suffix or `exportName` property
- Default exports: no suffix needed
- File extensions can be omitted

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    components: {
      // Logo and branding
      graphics: {
        Logo: '/components/Logo',
        Icon: '/components/Icon',
      },

      // Navigation
      Nav: '/components/CustomNav',
      beforeNavLinks: ['/components/CustomNavItem'],
      afterNavLinks: ['/components/NavFooter'],

      // Header
      header: ['/components/AnnouncementBanner'],
      actions: ['/components/ClearCache', '/components/Preview'],

      // Dashboard
      beforeDashboard: ['/components/WelcomeMessage'],
      afterDashboard: ['/components/Analytics'],

      // Auth
      beforeLogin: ['/components/SSOButtons'],
      logout: { Button: '/components/LogoutButton' },

      // Settings
      settingsMenu: ['/components/SettingsMenu'],

      // Views
      views: {
        dashboard: { Component: '/components/CustomDashboard' },
      },
    },
  },
})
```

**Component Path Rules:**

- Paths are relative to project root or `config.admin.importMap.baseDir`
- Named exports: use `#ExportName` suffix or `exportName` property
- Default exports: no suffix needed
- File extensions can be omitted

### Component Types

1. **Root Components** - Global Admin Panel (logo, nav, header)
2. **Collection Components** - Collection-specific (edit view, list view)
3. **Global Components** - Global document views
4. **Field Components** - Custom field UI and cells

#### Server vs Client Components

**All components are Server Components by default** (can use Local API directly):

```tsx
// Server Component (default)
import type { Payload } from 'payload'

async function MyServerComponent({ payload }: { payload: Payload }) {
  const posts = await payload.find({ collection: 'posts' })
  return <div>{posts.totalDocs} posts</div>
}

export default MyServerComponent
```

**Client Components** need the `'use client'` directive:

```tsx
'use client'
import { useState } from 'react'
import { useAuth } from '@payloadcms/ui'

export function MyClientComponent() {
  const [count, setCount] = useState(0)
  const { user } = useAuth()

  return (
    <button onClick={() => setCount(count + 1)}>
      {user?.email}: Clicked {count} times
    </button>
  )
}
```

### Using Hooks (Client Components Only)

```tsx
'use client'
import {
  useAuth, // Current user
  useConfig, // Payload config (client-safe)
  useDocumentInfo, // Document info (id, collection, etc.)
  useField, // Field value and setter
  useForm, // Form state
  useFormFields, // Multiple field values (optimized)
  useLocale, // Current locale
  useTranslation, // i18n translations
  usePayload, // Local API methods
} from '@payloadcms/ui'

export function MyComponent() {
  const { user } = useAuth()
  const { config } = useConfig()
  const { id, collection } = useDocumentInfo()
  const locale = useLocale()
  const { t } = useTranslation()

  return <div>Hello {user?.email}</div>
}
```

### Collection/Global Components

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      // Edit view
      edit: {
        PreviewButton: '/components/PostPreview',
        SaveButton: '/components/CustomSave',
        SaveDraftButton: '/components/SaveDraft',
        PublishButton: '/components/Publish',
      },

      // List view
      list: {
        Header: '/components/ListHeader',
        beforeList: ['/components/BulkActions'],
        afterList: ['/components/ListFooter'],
      },
    },
  },
}
```

### Field Components

```typescript
{
  name: 'status',
  type: 'select',
  options: ['draft', 'published'],
  admin: {
    components: {
      // Edit view field
      Field: '/components/StatusField',
      // List view cell
      Cell: '/components/StatusCell',
      // Field label
      Label: '/components/StatusLabel',
      // Field description
      Description: '/components/StatusDescription',
      // Error message
      Error: '/components/StatusError',
    },
  },
}
```

**UI Field** (presentational only, no data):

```typescript
{
  name: 'refundButton',
  type: 'ui',
  admin: {
    components: {
      Field: '/components/RefundButton',
    },
  },
}
```

### Performance Best Practices

1. **Import correctly:**
   - Admin Panel: `import { Button } from '@payloadcms/ui'`
   - Frontend: `import { Button } from '@payloadcms/ui/elements/Button'`

2. **Optimize re-renders:**

   ```tsx
   // ❌ BAD: Re-renders on every form change
   const { fields } = useForm()

   // ✅ GOOD: Only re-renders when specific field changes
   const value = useFormFields(([fields]) => fields[path])
   ```

3. **Prefer Server Components** - Only use Client Components when you need:
   - State (useState, useReducer)
   - Effects (useEffect)
   - Event handlers (onClick, onChange)
   - Browser APIs (localStorage, window)

4. **Minimize serialized props** - Server Components serialize props sent to client

### Styling Components

```tsx
import './styles.scss'

export function MyComponent() {
  return <div className="my-component">Content</div>
}
```

```scss
// Use Payload's CSS variables
.my-component {
  background-color: var(--theme-elevation-500);
  color: var(--theme-text);
  padding: var(--base);
  border-radius: var(--border-radius-m);
}

// Import Payload's SCSS library
@import '~@payloadcms/ui/scss';

.my-component {
  @include mid-break {
    background-color: var(--theme-elevation-900);
  }
}
```

### TS Type Safety

```tsx
import type {
  TextFieldServerComponent,
  TextFieldClientComponent,
  TextFieldCellComponent,
  SelectFieldServerComponent,
  // ... etc
} from 'payload'

export const MyField: TextFieldClientComponent = (props) => {
  // Fully typed props
}
```

### Import Map

Payload auto-generates `app/(payload)/admin/importMap.js` to resolve component paths.

**Regenerate manually:**

```bash
payload generate:importmap
```

**Set custom location:**

```typescript
export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
      importMapFile: path.resolve(dirname, 'app', 'custom-import-map.js'),
    },
  },
})
```

## Custom Endpoints

```typescript
import type { Endpoint } from 'payload'
import { APIError } from 'payload'

// Always check authentication
export const protectedEndpoint: Endpoint = {
  path: '/protected',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    // Use req.payload for database operations
    const data = await req.payload.find({
      collection: 'posts',
      where: { author: { equals: req.user.id } },
    })

    return Response.json(data)
  },
}

// Route parameters
export const trackingEndpoint: Endpoint = {
  path: '/:id/tracking',
  method: 'get',
  handler: async (req) => {
    const { id } = req.routeParams

    const tracking = await getTrackingInfo(id)

    if (!tracking) {
      return Response.json({ error: 'not found' }, { status: 404 })
    }

    return Response.json(tracking)
  },
}
```

## Drafts & Versions

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
      validate: false, // Don't validate drafts
    },
    maxPerDoc: 100,
  },
  access: {
    read: ({ req: { user } }) => {
      // Public sees only published
      if (!user) return { _status: { equals: 'published' } }
      // Authenticated sees all
      return true
    },
  },
}

// Create draft
await payload.create({
  collection: 'pages',
  data: { title: 'Draft Page' },
  draft: true, // Skips required field validation
})

// Read with drafts
const page = await payload.findByID({
  collection: 'pages',
  id: '123',
  draft: true, // Returns draft if available
})
```

## Field Type Guards

```typescript
import {
  fieldAffectsData,
  fieldHasSubFields,
  fieldIsArrayType,
  fieldIsBlockType,
  fieldSupportsMany,
  fieldHasMaxDepth,
} from 'payload'

function processField(field: Field) {
  // Check if field stores data
  if (fieldAffectsData(field)) {
    console.log(field.name) // Safe to access
  }

  // Check if field has nested fields
  if (fieldHasSubFields(field)) {
    field.fields.forEach(processField) // Safe to access
  }

  // Check field type
  if (fieldIsArrayType(field)) {
    console.log(field.minRows, field.maxRows)
  }

  // Check capabilities
  if (fieldSupportsMany(field) && field.hasMany) {
    console.log('Multiple values supported')
  }
}
```

## Plugins

### Using Plugins

```typescript
import { seoPlugin } from '@payloadcms/plugin-seo'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'

export default buildConfig({
  plugins: [
    seoPlugin({
      collections: ['posts', 'pages'],
    }),
    redirectsPlugin({
      collections: ['pages'],
    }),
  ],
})
```

### Creating Plugins

```typescript
import type { Config, Plugin } from 'payload'

interface MyPluginConfig {
  collections?: string[]
  enabled?: boolean
}

export const myPlugin =
  (options: MyPluginConfig): Plugin =>
  (config: Config): Config => ({
    ...config,
    collections: config.collections?.map((collection) => {
      if (options.collections?.includes(collection.slug)) {
        return {
          ...collection,
          fields: [...collection.fields, { name: 'pluginField', type: 'text' }],
        }
      }
      return collection
    }),
  })
```

## Best Practices

### Security

1. Always set `overrideAccess: false` when passing `user` to Local API
2. Field-level access only returns boolean (no query constraints)
3. Default to restrictive access, gradually add permissions
4. Never trust client-provided data
5. Use `saveToJWT: true` for roles to avoid database lookups

### Performance

1. Index frequently queried fields
2. Use `select` to limit returned fields
3. Set `maxDepth` on relationships to prevent over-fetching
4. Use query constraints over async operations in access control
5. Cache expensive operations in `req.context`

### Data Integrity

1. Always pass `req` to nested operations in hooks
2. Use context flags to prevent infinite hook loops
3. Enable transactions for MongoDB (requires replica set) and Postgres
4. Use `beforeValidate` for data formatting
5. Use `beforeChange` for business logic

### Type Safety

1. Run `generate:types` after schema changes
2. Import types from generated `payload-types.ts`
3. Type your user object: `import type { User } from '@/payload-types'`
4. Use `as const` for field options
5. Use field type guards for runtime type checking

### Organization

1. Keep collections in separate files
2. Extract access control to `access/` directory
3. Extract hooks to `hooks/` directory
4. Use reusable field factories for common patterns
5. Document complex access control with comments

## Common Gotchas

1. **Local API Default**: Access control bypassed unless `overrideAccess: false`
2. **Transaction Safety**: Missing `req` in nested operations breaks atomicity
3. **Hook Loops**: Operations in hooks can trigger the same hooks
4. **Field Access**: Cannot use query constraints, only boolean
5. **Relationship Depth**: Default depth is 2, set to 0 for IDs only
6. **Draft Status**: `_status` field auto-injected when drafts enabled
7. **Type Generation**: Types not updated until `generate:types` runs
8. **MongoDB Transactions**: Require replica set configuration
9. **SQLite Transactions**: Disabled by default, enable with `transactionOptions: {}`
10. **Point Fields**: Not supported in SQLite

## Additional Context Files

For deeper exploration of specific topics, refer to the context files located in `.cursor/rules/`:

### Available Context Files

1. **`payload-overview.md`** - High-level architecture and core concepts
   - Payload structure and initialization
   - Configuration fundamentals
   - Database adapters overview

2. **`security-critical.md`** - Critical security patterns (⚠️ IMPORTANT)
   - Local API access control
   - Transaction safety in hooks
   - Preventing infinite hook loops

3. **`collections.md`** - Collection configurations
   - Basic collection patterns
   - Auth collections with RBAC
   - Upload collections
   - Drafts and versioning
   - Globals

4. **`fields.md`** - Field types and patterns
   - All field types with examples
   - Conditional fields
   - Virtual fields
   - Field validation
   - Common field patterns

5. **`field-type-guards.md`** - TypeScript field type utilities
   - Field type checking utilities
   - Safe type narrowing
   - Runtime field validation

6. **`access-control.md`** - Permission patterns
   - Collection-level access
   - Field-level access
   - Row-level security
   - RBAC patterns
   - Multi-tenant access control

7. **`access-control-advanced.md`** - Complex access patterns
   - Nested document access
   - Cross-collection permissions
   - Dynamic role hierarchies
   - Performance optimization

8. **`hooks.md`** - Lifecycle hooks
   - Collection hooks
   - Field hooks
   - Hook context patterns
   - Common hook recipes

9. **`queries.md`** - Database operations
   - Local API usage
   - Query operators
   - Complex queries with AND/OR
   - Performance optimization

10. **`endpoints.md`** - Custom API endpoints
    - REST endpoint patterns
    - Authentication in endpoints
    - Error handling
    - Route parameters

11. **`adapters.md`** - Database and storage adapters
    - MongoDB, PostgreSQL, SQLite patterns
    - Storage adapter usage (S3, Azure, GCS, etc.)
    - Custom adapter development

12. **`plugin-development.md`** - Creating plugins
    - Plugin architecture
    - Modifying configuration
    - Plugin hooks
    - Best practices

13. **`components.md`** - Custom Components
    - Component types (Root, Collection, Global, Field)
    - Server vs Client Components
    - Component paths and definition
    - Default and custom props
    - Using hooks
    - Performance best practices
    - Styling components

## Resources

- Docs: <https://payloadcms.com/docs>
- LLM Context: <https://payloadcms.com/llms-full.txt>
- GitHub: <https://github.com/payloadcms/payload>
- Examples: <https://github.com/payloadcms/payload/tree/main/examples>
- Templates: <https://github.com/payloadcms/payload/tree/main/templates>

<!-- NEXTJS-DOCS-START -->

## Next.js Documentation Index (v15.4.11)

The following Next.js documentation files are available in the `.next-docs/` directory:

- [index.mdx](.next-docs/index.mdx) (2.5KB)
- **01-app/**:
  - [index.mdx](.next-docs/01-app/index.mdx) (0.6KB)
  - **01-getting-started/**:
    - [01-installation.mdx](.next-docs/01-app/01-getting-started/01-installation.mdx) (11.2KB)
    - [02-project-structure.mdx](.next-docs/01-app/01-getting-started/02-project-structure.mdx) (24.2KB)
    - [03-layouts-and-pages.mdx](.next-docs/01-app/01-getting-started/03-layouts-and-pages.mdx) (10.8KB)
    - [04-linking-and-navigating.mdx](.next-docs/01-app/01-getting-started/04-linking-and-navigating.mdx) (16.4KB)
    - [05-server-and-client-components.mdx](.next-docs/01-app/01-getting-started/05-server-and-client-components.mdx) (17.9KB)
    - [06-partial-prerendering.mdx](.next-docs/01-app/01-getting-started/06-partial-prerendering.mdx) (9.3KB)
    - [07-fetching-data.mdx](.next-docs/01-app/01-getting-started/07-fetching-data.mdx) (20.6KB)
    - [08-updating-data.mdx](.next-docs/01-app/01-getting-started/08-updating-data.mdx) (12.5KB)
    - [09-caching-and-revalidating.mdx](.next-docs/01-app/01-getting-started/09-caching-and-revalidating.mdx) (7.2KB)
    - [10-error-handling.mdx](.next-docs/01-app/01-getting-started/10-error-handling.mdx) (10.1KB)
    - [11-css.mdx](.next-docs/01-app/01-getting-started/11-css.mdx) (8.5KB)
    - [12-images.mdx](.next-docs/01-app/01-getting-started/12-images.mdx) (5.7KB)
    - [13-fonts.mdx](.next-docs/01-app/01-getting-started/13-fonts.mdx) (4.8KB)
    - [14-metadata-and-og-images.mdx](.next-docs/01-app/01-getting-started/14-metadata-and-og-images.mdx) (11.1KB)
    - [15-route-handlers-and-middleware.mdx](.next-docs/01-app/01-getting-started/15-route-handlers-and-middleware.mdx) (7.5KB)
    - [16-deploying.mdx](.next-docs/01-app/01-getting-started/16-deploying.mdx) (3.9KB)
    - [17-upgrading.mdx](.next-docs/01-app/01-getting-started/17-upgrading.mdx) (1.9KB)
    - [index.mdx](.next-docs/01-app/01-getting-started/index.mdx) (0.7KB)
  - **02-guides/**:
    - [analytics.mdx](.next-docs/01-app/02-guides/analytics.mdx) (6.8KB)
    - [authentication.mdx](.next-docs/01-app/02-guides/authentication.mdx) (52.9KB)
    - [backend-for-frontend.mdx](.next-docs/01-app/02-guides/backend-for-frontend.mdx) (24.1KB)
    - [caching.mdx](.next-docs/01-app/02-guides/caching.mdx) (35.4KB)
    - [ci-build-caching.mdx](.next-docs/01-app/02-guides/ci-build-caching.mdx) (4.8KB)
    - [content-security-policy.mdx](.next-docs/01-app/02-guides/content-security-policy.mdx) (8.2KB)
    - [css-in-js.mdx](.next-docs/01-app/02-guides/css-in-js.mdx) (10.7KB)
    - [custom-server.mdx](.next-docs/01-app/02-guides/custom-server.mdx) (5.7KB)
    - [data-security.mdx](.next-docs/01-app/02-guides/data-security.mdx) (18.1KB)
    - [debugging.mdx](.next-docs/01-app/02-guides/debugging.mdx) (8.6KB)
    - [draft-mode.mdx](.next-docs/01-app/02-guides/draft-mode.mdx) (7.5KB)
    - [environment-variables.mdx](.next-docs/01-app/02-guides/environment-variables.mdx) (11.4KB)
    - [forms.mdx](.next-docs/01-app/02-guides/forms.mdx) (13.6KB)
    - [incremental-static-regeneration.mdx](.next-docs/01-app/02-guides/incremental-static-regeneration.mdx) (18.9KB)
    - [index.mdx](.next-docs/01-app/02-guides/index.mdx) (0.1KB)
    - [instrumentation.mdx](.next-docs/01-app/02-guides/instrumentation.mdx) (4.0KB)
    - [internationalization.mdx](.next-docs/01-app/02-guides/internationalization.mdx) (7.2KB)
    - [json-ld.mdx](.next-docs/01-app/02-guides/json-ld.mdx) (3.0KB)
    - [lazy-loading.mdx](.next-docs/01-app/02-guides/lazy-loading.mdx) (8.5KB)
    - [local-development.mdx](.next-docs/01-app/02-guides/local-development.mdx) (8.4KB)
    - [mdx.mdx](.next-docs/01-app/02-guides/mdx.mdx) (25.4KB)
    - [memory-usage.mdx](.next-docs/01-app/02-guides/memory-usage.mdx) (7.7KB)
    - [multi-tenant.mdx](.next-docs/01-app/02-guides/multi-tenant.mdx) (0.4KB)
    - [multi-zones.mdx](.next-docs/01-app/02-guides/multi-zones.mdx) (7.1KB)
    - [open-telemetry.mdx](.next-docs/01-app/02-guides/open-telemetry.mdx) (13.7KB)
    - [package-bundling.mdx](.next-docs/01-app/02-guides/package-bundling.mdx) (5.5KB)
    - [prefetching.mdx](.next-docs/01-app/02-guides/prefetching.mdx) (11.9KB)
    - [production-checklist.mdx](.next-docs/01-app/02-guides/production-checklist.mdx) (12.7KB)
    - [progressive-web-apps.mdx](.next-docs/01-app/02-guides/progressive-web-apps.mdx) (20.8KB)
    - [redirecting.mdx](.next-docs/01-app/02-guides/redirecting.mdx) (21.5KB)
    - [sass.mdx](.next-docs/01-app/02-guides/sass.mdx) (3.1KB)
    - [scripts.mdx](.next-docs/01-app/02-guides/scripts.mdx) (11.8KB)
    - [self-hosting.mdx](.next-docs/01-app/02-guides/self-hosting.mdx) (13.7KB)
    - [single-page-applications.mdx](.next-docs/01-app/02-guides/single-page-applications.mdx) (15.7KB)
    - [static-exports.mdx](.next-docs/01-app/02-guides/static-exports.mdx) (12.2KB)
    - [tailwind-css.mdx](.next-docs/01-app/02-guides/tailwind-css.mdx) (5.1KB)
    - [third-party-libraries.mdx](.next-docs/01-app/02-guides/third-party-libraries.mdx) (16.1KB)
    - [videos.mdx](.next-docs/01-app/02-guides/videos.mdx) (16.2KB)
    - **migrating/**:
      - [app-router-migration.mdx](.next-docs/01-app/02-guides/migrating/app-router-migration.mdx) (36.5KB)
      - [from-create-react-app.mdx](.next-docs/01-app/02-guides/migrating/from-create-react-app.mdx) (21.2KB)
      - [from-vite.mdx](.next-docs/01-app/02-guides/migrating/from-vite.mdx) (22.0KB)
      - [index.mdx](.next-docs/01-app/02-guides/migrating/index.mdx) (0.1KB)
    - **testing/**:
      - [cypress.mdx](.next-docs/01-app/02-guides/testing/cypress.mdx) (8.1KB)
      - [index.mdx](.next-docs/01-app/02-guides/testing/index.mdx) (1.8KB)
      - [jest.mdx](.next-docs/01-app/02-guides/testing/jest.mdx) (12.7KB)
      - [playwright.mdx](.next-docs/01-app/02-guides/testing/playwright.mdx) (4.3KB)
      - [vitest.mdx](.next-docs/01-app/02-guides/testing/vitest.mdx) (5.1KB)
    - **upgrading/**:
      - [codemods.mdx](.next-docs/01-app/02-guides/upgrading/codemods.mdx) (12.9KB)
      - [index.mdx](.next-docs/01-app/02-guides/upgrading/index.mdx) (0.2KB)
      - [version-14.mdx](.next-docs/01-app/02-guides/upgrading/version-14.mdx) (1.8KB)
      - [version-15.mdx](.next-docs/01-app/02-guides/upgrading/version-15.mdx) (16.1KB)
  - **03-api-reference/**:
    - [07-edge.mdx](.next-docs/01-app/03-api-reference/07-edge.mdx) (28.7KB)
    - [08-turbopack.mdx](.next-docs/01-app/03-api-reference/08-turbopack.mdx) (14.2KB)
    - [index.mdx](.next-docs/01-app/03-api-reference/index.mdx) (0.1KB)
    - **01-directives/**:
      - [index.mdx](.next-docs/01-app/03-api-reference/01-directives/index.mdx) (0.1KB)
      - [use-cache.mdx](.next-docs/01-app/03-api-reference/01-directives/use-cache.mdx) (11.4KB)
      - [use-client.mdx](.next-docs/01-app/03-api-reference/01-directives/use-client.mdx) (3.7KB)
      - [use-server.mdx](.next-docs/01-app/03-api-reference/01-directives/use-server.mdx) (4.9KB)
    - **02-components/**:
      - [font.mdx](.next-docs/01-app/03-api-reference/02-components/font.mdx) (30.8KB)
      - [form.mdx](.next-docs/01-app/03-api-reference/02-components/form.mdx) (14.0KB)
      - [image.mdx](.next-docs/01-app/03-api-reference/02-components/image.mdx) (52.3KB)
      - [index.mdx](.next-docs/01-app/03-api-reference/02-components/index.mdx) (0.3KB)
      - [link.mdx](.next-docs/01-app/03-api-reference/02-components/link.mdx) (38.6KB)
      - [script.mdx](.next-docs/01-app/03-api-reference/02-components/script.mdx) (13.0KB)
    - **03-file-conventions/**:
      - [default.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/default.mdx) (2.9KB)
      - [dynamic-routes.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.mdx) (6.3KB)
      - [error.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/error.mdx) (8.9KB)
      - [forbidden.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/forbidden.mdx) (1.2KB)
      - [index.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/index.mdx) (0.1KB)
      - [instrumentation-client.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/instrumentation-client.mdx) (1.5KB)
      - [instrumentation.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/instrumentation.mdx) (4.6KB)
      - [intercepting-routes.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/intercepting-routes.mdx) (3.8KB)
      - [layout.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/layout.mdx) (17.4KB)
      - [loading.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/loading.mdx) (6.8KB)
      - [mdx-components.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/mdx-components.mdx) (1.9KB)
      - [middleware.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/middleware.mdx) (24.3KB)
      - [not-found.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/not-found.mdx) (2.7KB)
      - [page.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/page.mdx) (7.3KB)
      - [parallel-routes.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/parallel-routes.mdx) (14.9KB)
      - [public-folder.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/public-folder.mdx) (1.8KB)
      - [route-groups.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/route-groups.mdx) (1.6KB)
      - [route-segment-config.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/route-segment-config.mdx) (15.1KB)
      - [route.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/route.mdx) (18.4KB)
      - [src-folder.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/src-folder.mdx) (2.0KB)
      - [template.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/template.mdx) (2.4KB)
      - [unauthorized.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/unauthorized.mdx) (2.5KB)
      - **01-metadata/**:
        - [app-icons.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.mdx) (8.8KB)
        - [index.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/01-metadata/index.mdx) (1.3KB)
        - [manifest.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/01-metadata/manifest.mdx) (2.2KB)
        - [opengraph-image.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.mdx) (14.3KB)
        - [robots.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.mdx) (3.0KB)
        - [sitemap.mdx](.next-docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.mdx) (11.2KB)
    - **04-functions/**:
      - [after.mdx](.next-docs/01-app/03-api-reference/04-functions/after.mdx) (7.2KB)
      - [cacheLife.mdx](.next-docs/01-app/03-api-reference/04-functions/cacheLife.mdx) (10.1KB)
      - [cacheTag.mdx](.next-docs/01-app/03-api-reference/04-functions/cacheTag.mdx) (4.9KB)
      - [connection.mdx](.next-docs/01-app/03-api-reference/04-functions/connection.mdx) (1.8KB)
      - [cookies.mdx](.next-docs/01-app/03-api-reference/04-functions/cookies.mdx) (11.3KB)
      - [draft-mode.mdx](.next-docs/01-app/03-api-reference/04-functions/draft-mode.mdx) (4.7KB)
      - [fetch.mdx](.next-docs/01-app/03-api-reference/04-functions/fetch.mdx) (5.1KB)
      - [forbidden.mdx](.next-docs/01-app/03-api-reference/04-functions/forbidden.mdx) (4.4KB)
      - [generate-image-metadata.mdx](.next-docs/01-app/03-api-reference/04-functions/generate-image-metadata.mdx) (5.5KB)
      - [generate-metadata.mdx](.next-docs/01-app/03-api-reference/04-functions/generate-metadata.mdx) (43.1KB)
      - [generate-sitemaps.mdx](.next-docs/01-app/03-api-reference/04-functions/generate-sitemaps.mdx) (2.8KB)
      - [generate-static-params.mdx](.next-docs/01-app/03-api-reference/04-functions/generate-static-params.mdx) (14.1KB)
      - [generate-viewport.mdx](.next-docs/01-app/03-api-reference/04-functions/generate-viewport.mdx) (5.9KB)
      - [headers.mdx](.next-docs/01-app/03-api-reference/04-functions/headers.mdx) (3.9KB)
      - [image-response.mdx](.next-docs/01-app/03-api-reference/04-functions/image-response.mdx) (5.6KB)
      - [index.mdx](.next-docs/01-app/03-api-reference/04-functions/index.mdx) (0.3KB)
      - [next-request.mdx](.next-docs/01-app/03-api-reference/04-functions/next-request.mdx) (6.1KB)
      - [next-response.mdx](.next-docs/01-app/03-api-reference/04-functions/next-response.mdx) (4.2KB)
      - [not-found.mdx](.next-docs/01-app/03-api-reference/04-functions/not-found.mdx) (1.3KB)
      - [permanentRedirect.mdx](.next-docs/01-app/03-api-reference/04-functions/permanentRedirect.mdx) (2.9KB)
      - [redirect.mdx](.next-docs/01-app/03-api-reference/04-functions/redirect.mdx) (7.7KB)
      - [revalidatePath.mdx](.next-docs/01-app/03-api-reference/04-functions/revalidatePath.mdx) (4.0KB)
      - [revalidateTag.mdx](.next-docs/01-app/03-api-reference/04-functions/revalidateTag.mdx) (1.9KB)
      - [unauthorized.mdx](.next-docs/01-app/03-api-reference/04-functions/unauthorized.mdx) (5.6KB)
      - [unstable_cache.mdx](.next-docs/01-app/03-api-reference/04-functions/unstable_cache.mdx) (3.3KB)
      - [unstable_noStore.mdx](.next-docs/01-app/03-api-reference/04-functions/unstable_noStore.mdx) (1.7KB)
      - [unstable_rethrow.mdx](.next-docs/01-app/03-api-reference/04-functions/unstable_rethrow.mdx) (2.9KB)
      - [use-link-status.mdx](.next-docs/01-app/03-api-reference/04-functions/use-link-status.mdx) (5.7KB)
      - [use-params.mdx](.next-docs/01-app/03-api-reference/04-functions/use-params.mdx) (2.4KB)
      - [use-pathname.mdx](.next-docs/01-app/03-api-reference/04-functions/use-pathname.mdx) (3.6KB)
      - [use-report-web-vitals.mdx](.next-docs/01-app/03-api-reference/04-functions/use-report-web-vitals.mdx) (8.0KB)
      - [use-router.mdx](.next-docs/01-app/03-api-reference/04-functions/use-router.mdx) (6.2KB)
      - [use-search-params.mdx](.next-docs/01-app/03-api-reference/04-functions/use-search-params.mdx) (12.7KB)
      - [use-selected-layout-segment.mdx](.next-docs/01-app/03-api-reference/04-functions/use-selected-layout-segment.mdx) (5.5KB)
      - [use-selected-layout-segments.mdx](.next-docs/01-app/03-api-reference/04-functions/use-selected-layout-segments.mdx) (3.1KB)
      - [userAgent.mdx](.next-docs/01-app/03-api-reference/04-functions/userAgent.mdx) (3.2KB)
    - **05-config/**:
      - [02-typescript.mdx](.next-docs/01-app/03-api-reference/05-config/02-typescript.mdx) (11.7KB)
      - [03-eslint.mdx](.next-docs/01-app/03-api-reference/05-config/03-eslint.mdx) (16.6KB)
      - [index.mdx](.next-docs/01-app/03-api-reference/05-config/index.mdx) (0.1KB)
      - **01-next-config-js/**:
        - [allowedDevOrigins.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.mdx) (1.1KB)
        - [appDir.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/appDir.mdx) (0.8KB)
        - [assetPrefix.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/assetPrefix.mdx) (3.5KB)
        - [authInterrupts.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/authInterrupts.mdx) (1.0KB)
        - [basePath.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/basePath.mdx) (2.1KB)
        - [cacheLife.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/cacheLife.mdx) (2.8KB)
        - [compress.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/compress.mdx) (1.6KB)
        - [crossOrigin.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/crossOrigin.mdx) (1.2KB)
        - [cssChunking.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/cssChunking.mdx) (2.0KB)
        - [devIndicators.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/devIndicators.mdx) (3.1KB)
        - [distDir.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/distDir.mdx) (0.8KB)
        - [dynamicIO.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/dynamicIO.mdx) (1.6KB)
        - [env.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/env.mdx) (2.3KB)
        - [eslint.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/eslint.mdx) (1.1KB)
        - [expireTime.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/expireTime.mdx) (1.0KB)
        - [exportPathMap.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/exportPathMap.mdx) (4.2KB)
        - [generateBuildId.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/generateBuildId.mdx) (0.9KB)
        - [generateEtags.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/generateEtags.mdx) (0.7KB)
        - [headers.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/headers.mdx) (17.4KB)
        - [htmlLimitedBots.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/htmlLimitedBots.mdx) (1.2KB)
        - [httpAgentOptions.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/httpAgentOptions.mdx) (0.9KB)
        - [images.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/images.mdx) (8.6KB)
        - [incrementalCacheHandlerPath.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/incrementalCacheHandlerPath.mdx) (3.3KB)
        - [index.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/index.mdx) (4.6KB)
        - [inlineCss.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/inlineCss.mdx) (3.3KB)
        - [logging.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/logging.mdx) (1.9KB)
        - [mdxRs.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/mdxRs.mdx) (0.5KB)
        - [middlewareClientMaxBodySize.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/middlewareClientMaxBodySize.mdx) (3.4KB)
        - [onDemandEntries.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/onDemandEntries.mdx) (0.9KB)
        - [optimizePackageImports.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/optimizePackageImports.mdx) (1.3KB)
        - [output.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/output.mdx) (5.2KB)
        - [pageExtensions.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/pageExtensions.mdx) (2.0KB)
        - [poweredByHeader.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/poweredByHeader.mdx) (0.6KB)
        - [ppr.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/ppr.mdx) (2.7KB)
        - [productionBrowserSourceMaps.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/productionBrowserSourceMaps.mdx) (1.1KB)
        - [reactCompiler.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/reactCompiler.mdx) (2.7KB)
        - [reactMaxHeadersLength.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/reactMaxHeadersLength.mdx) (0.9KB)
        - [reactStrictMode.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/reactStrictMode.mdx) (1.3KB)
        - [redirects.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.mdx) (11.4KB)
        - [rewrites.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/rewrites.mdx) (15.5KB)
        - [sassOptions.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/sassOptions.mdx) (0.8KB)
        - [serverActions.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.mdx) (1.6KB)
        - [serverComponentsHmrCache.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/serverComponentsHmrCache.mdx) (1.4KB)
        - [serverExternalPackages.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/serverExternalPackages.mdx) (2.5KB)
        - [staleTimes.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/staleTimes.mdx) (2.2KB)
        - [staticGeneration.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/staticGeneration.mdx) (1.1KB)
        - [taint.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/taint.mdx) (6.4KB)
        - [trailingSlash.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/trailingSlash.mdx) (1.5KB)
        - [transpilePackages.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/transpilePackages.mdx) (0.9KB)
        - [turbopack.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/turbopack.mdx) (6.9KB)
        - [typedRoutes.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/typedRoutes.mdx) (0.5KB)
        - [typescript.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/typescript.mdx) (1.1KB)
        - [urlImports.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/urlImports.mdx) (2.8KB)
        - [useCache.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/useCache.mdx) (1.1KB)
        - [useLightningcss.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/useLightningcss.mdx) (0.6KB)
        - [viewTransition.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/viewTransition.mdx) (1.8KB)
        - [webpack.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/webpack.mdx) (3.3KB)
        - [webVitalsAttribution.mdx](.next-docs/01-app/03-api-reference/05-config/01-next-config-js/webVitalsAttribution.mdx) (1.9KB)
    - **06-cli/**:
      - [create-next-app.mdx](.next-docs/01-app/03-api-reference/06-cli/create-next-app.mdx) (4.9KB)
      - [index.mdx](.next-docs/01-app/03-api-reference/06-cli/index.mdx) (0.7KB)
      - [next.mdx](.next-docs/01-app/03-api-reference/06-cli/next.mdx) (20.2KB)
- **02-pages/**:
  - [index.mdx](.next-docs/02-pages/index.mdx) (0.6KB)
  - **01-getting-started/**:
    - [01-installation.mdx](.next-docs/02-pages/01-getting-started/01-installation.mdx) (0.6KB)
    - [02-project-structure.mdx](.next-docs/02-pages/01-getting-started/02-project-structure.mdx) (0.6KB)
    - [04-images.mdx](.next-docs/02-pages/01-getting-started/04-images.mdx) (0.6KB)
    - [05-fonts.mdx](.next-docs/02-pages/01-getting-started/05-fonts.mdx) (0.6KB)
    - [06-css.mdx](.next-docs/02-pages/01-getting-started/06-css.mdx) (0.7KB)
    - [11-deploying.mdx](.next-docs/02-pages/01-getting-started/11-deploying.mdx) (0.2KB)
    - [index.mdx](.next-docs/02-pages/01-getting-started/index.mdx) (0.2KB)
  - **02-guides/**:
    - [amp.mdx](.next-docs/02-pages/02-guides/amp.mdx) (4.5KB)
    - [analytics.mdx](.next-docs/02-pages/02-guides/analytics.mdx) (0.5KB)
    - [authentication.mdx](.next-docs/02-pages/02-guides/authentication.mdx) (0.6KB)
    - [babel.mdx](.next-docs/02-pages/02-guides/babel.mdx) (2.1KB)
    - [ci-build-caching.mdx](.next-docs/02-pages/02-guides/ci-build-caching.mdx) (0.5KB)
    - [content-security-policy.mdx](.next-docs/02-pages/02-guides/content-security-policy.mdx) (0.6KB)
    - [css-in-js.mdx](.next-docs/02-pages/02-guides/css-in-js.mdx) (0.5KB)
    - [custom-server.mdx](.next-docs/02-pages/02-guides/custom-server.mdx) (0.5KB)
    - [debugging.mdx](.next-docs/02-pages/02-guides/debugging.mdx) (0.5KB)
    - [draft-mode.mdx](.next-docs/02-pages/02-guides/draft-mode.mdx) (8.0KB)
    - [environment-variables.mdx](.next-docs/02-pages/02-guides/environment-variables.mdx) (0.5KB)
    - [forms.mdx](.next-docs/02-pages/02-guides/forms.mdx) (8.7KB)
    - [incremental-static-regeneration.mdx](.next-docs/02-pages/02-guides/incremental-static-regeneration.mdx) (0.6KB)
    - [index.mdx](.next-docs/02-pages/02-guides/index.mdx) (0.1KB)
    - [instrumentation.mdx](.next-docs/02-pages/02-guides/instrumentation.mdx) (0.5KB)
    - [internationalization.mdx](.next-docs/02-pages/02-guides/internationalization.mdx) (14.7KB)
    - [lazy-loading.mdx](.next-docs/02-pages/02-guides/lazy-loading.mdx) (0.6KB)
    - [mdx.mdx](.next-docs/02-pages/02-guides/mdx.mdx) (0.5KB)
    - [multi-zones.mdx](.next-docs/02-pages/02-guides/multi-zones.mdx) (0.6KB)
    - [open-telemetry.mdx](.next-docs/02-pages/02-guides/open-telemetry.mdx) (0.5KB)
    - [package-bundling.mdx](.next-docs/02-pages/02-guides/package-bundling.mdx) (0.6KB)
    - [post-css.mdx](.next-docs/02-pages/02-guides/post-css.mdx) (5.7KB)
    - [preview-mode.mdx](.next-docs/02-pages/02-guides/preview-mode.mdx) (14.0KB)
    - [production-checklist.mdx](.next-docs/02-pages/02-guides/production-checklist.mdx) (0.6KB)
    - [redirecting.mdx](.next-docs/02-pages/02-guides/redirecting.mdx) (0.5KB)
    - [sass.mdx](.next-docs/02-pages/02-guides/sass.mdx) (0.5KB)
    - [scripts.mdx](.next-docs/02-pages/02-guides/scripts.mdx) (0.5KB)
    - [self-hosting.mdx](.next-docs/02-pages/02-guides/self-hosting.mdx) (0.6KB)
    - [static-exports.mdx](.next-docs/02-pages/02-guides/static-exports.mdx) (0.6KB)
    - [tailwind-css.mdx](.next-docs/02-pages/02-guides/tailwind-css.mdx) (0.4KB)
    - [third-party-libraries.mdx](.next-docs/02-pages/02-guides/third-party-libraries.mdx) (0.6KB)
    - **migrating/**:
      - [app-router-migration.mdx](.next-docs/02-pages/02-guides/migrating/app-router-migration.mdx) (0.6KB)
      - [from-create-react-app.mdx](.next-docs/02-pages/02-guides/migrating/from-create-react-app.mdx) (0.6KB)
      - [from-vite.mdx](.next-docs/02-pages/02-guides/migrating/from-vite.mdx) (0.5KB)
      - [index.mdx](.next-docs/02-pages/02-guides/migrating/index.mdx) (0.1KB)
    - **testing/**:
      - [cypress.mdx](.next-docs/02-pages/02-guides/testing/cypress.mdx) (0.5KB)
      - [index.mdx](.next-docs/02-pages/02-guides/testing/index.mdx) (0.5KB)
      - [jest.mdx](.next-docs/02-pages/02-guides/testing/jest.mdx) (0.5KB)
      - [playwright.mdx](.next-docs/02-pages/02-guides/testing/playwright.mdx) (0.5KB)
      - [vitest.mdx](.next-docs/02-pages/02-guides/testing/vitest.mdx) (0.5KB)
    - **upgrading/**:
      - [codemods.mdx](.next-docs/02-pages/02-guides/upgrading/codemods.mdx) (0.5KB)
      - [index.mdx](.next-docs/02-pages/02-guides/upgrading/index.mdx) (0.2KB)
      - [version-10.mdx](.next-docs/02-pages/02-guides/upgrading/version-10.mdx) (0.6KB)
      - [version-11.mdx](.next-docs/02-pages/02-guides/upgrading/version-11.mdx) (6.4KB)
      - [version-12.mdx](.next-docs/02-pages/02-guides/upgrading/version-12.mdx) (7.3KB)
      - [version-13.mdx](.next-docs/02-pages/02-guides/upgrading/version-13.mdx) (5.2KB)
      - [version-14.mdx](.next-docs/02-pages/02-guides/upgrading/version-14.mdx) (0.5KB)
      - [version-9.mdx](.next-docs/02-pages/02-guides/upgrading/version-9.mdx) (6.0KB)
  - **03-building-your-application/**:
    - [index.mdx](.next-docs/02-pages/03-building-your-application/index.mdx) (0.1KB)
    - **01-routing/**:
      - [01-pages-and-layouts.mdx](.next-docs/02-pages/03-building-your-application/01-routing/01-pages-and-layouts.mdx) (6.7KB)
      - [02-dynamic-routes.mdx](.next-docs/02-pages/03-building-your-application/01-routing/02-dynamic-routes.mdx) (3.1KB)
      - [03-linking-and-navigating.mdx](.next-docs/02-pages/03-building-your-application/01-routing/03-linking-and-navigating.mdx) (6.3KB)
      - [05-custom-app.mdx](.next-docs/02-pages/03-building-your-application/01-routing/05-custom-app.mdx) (3.2KB)
      - [06-custom-document.mdx](.next-docs/02-pages/03-building-your-application/01-routing/06-custom-document.mdx) (4.7KB)
      - [07-api-routes.mdx](.next-docs/02-pages/03-building-your-application/01-routing/07-api-routes.mdx) (15.0KB)
      - [08-custom-error.mdx](.next-docs/02-pages/03-building-your-application/01-routing/08-custom-error.mdx) (3.7KB)
      - [index.mdx](.next-docs/02-pages/03-building-your-application/01-routing/index.mdx) (0.3KB)
    - **02-rendering/**:
      - [01-server-side-rendering.mdx](.next-docs/02-pages/03-building-your-application/02-rendering/01-server-side-rendering.mdx) (1.3KB)
      - [02-static-site-generation.mdx](.next-docs/02-pages/03-building-your-application/02-rendering/02-static-site-generation.mdx) (10.1KB)
      - [04-automatic-static-optimization.mdx](.next-docs/02-pages/03-building-your-application/02-rendering/04-automatic-static-optimization.mdx) (3.7KB)
      - [05-client-side-rendering.mdx](.next-docs/02-pages/03-building-your-application/02-rendering/05-client-side-rendering.mdx) (3.9KB)
      - [index.mdx](.next-docs/02-pages/03-building-your-application/02-rendering/index.mdx) (1.7KB)
    - **03-data-fetching/**:
      - [01-get-static-props.mdx](.next-docs/02-pages/03-building-your-application/03-data-fetching/01-get-static-props.mdx) (9.2KB)
      - [02-get-static-paths.mdx](.next-docs/02-pages/03-building-your-application/03-data-fetching/02-get-static-paths.mdx) (5.1KB)
      - [03-forms-and-mutations.mdx](.next-docs/02-pages/03-building-your-application/03-data-fetching/03-forms-and-mutations.mdx) (3.6KB)
      - [03-get-server-side-props.mdx](.next-docs/02-pages/03-building-your-application/03-data-fetching/03-get-server-side-props.mdx) (4.9KB)
      - [05-client-side.mdx](.next-docs/02-pages/03-building-your-application/03-data-fetching/05-client-side.mdx) (2.6KB)
      - [index.mdx](.next-docs/02-pages/03-building-your-application/03-data-fetching/index.mdx) (4.3KB)
    - **06-configuring/**:
      - [12-error-handling.mdx](.next-docs/02-pages/03-building-your-application/06-configuring/12-error-handling.mdx) (4.1KB)
      - [index.mdx](.next-docs/02-pages/03-building-your-application/06-configuring/index.mdx) (0.3KB)
  - **04-api-reference/**:
    - [06-edge.mdx](.next-docs/02-pages/04-api-reference/06-edge.mdx) (0.4KB)
    - [08-turbopack.mdx](.next-docs/02-pages/04-api-reference/08-turbopack.mdx) (0.2KB)
    - [index.mdx](.next-docs/02-pages/04-api-reference/index.mdx) (0.1KB)
    - **01-components/**:
      - [font.mdx](.next-docs/02-pages/04-api-reference/01-components/font.mdx) (0.5KB)
      - [form.mdx](.next-docs/02-pages/04-api-reference/01-components/form.mdx) (0.5KB)
      - [head.mdx](.next-docs/02-pages/04-api-reference/01-components/head.mdx) (2.1KB)
      - [image-legacy.mdx](.next-docs/02-pages/04-api-reference/01-components/image-legacy.mdx) (30.3KB)
      - [image.mdx](.next-docs/02-pages/04-api-reference/01-components/image.mdx) (0.5KB)
      - [index.mdx](.next-docs/02-pages/04-api-reference/01-components/index.mdx) (0.5KB)
      - [link.mdx](.next-docs/02-pages/04-api-reference/01-components/link.mdx) (0.4KB)
      - [script.mdx](.next-docs/02-pages/04-api-reference/01-components/script.mdx) (0.5KB)
    - **02-file-conventions/**:
      - [index.mdx](.next-docs/02-pages/04-api-reference/02-file-conventions/index.mdx) (0.1KB)
      - [instrumentation.mdx](.next-docs/02-pages/04-api-reference/02-file-conventions/instrumentation.mdx) (0.5KB)
      - [middleware.mdx](.next-docs/02-pages/04-api-reference/02-file-conventions/middleware.mdx) (0.5KB)
      - [public-folder.mdx](.next-docs/02-pages/04-api-reference/02-file-conventions/public-folder.mdx) (0.5KB)
      - [src-folder.mdx](.next-docs/02-pages/04-api-reference/02-file-conventions/src-folder.mdx) (0.5KB)
    - **03-functions/**:
      - [get-initial-props.mdx](.next-docs/02-pages/04-api-reference/03-functions/get-initial-props.mdx) (3.7KB)
      - [get-server-side-props.mdx](.next-docs/02-pages/04-api-reference/03-functions/get-server-side-props.mdx) (7.4KB)
      - [get-static-paths.mdx](.next-docs/02-pages/04-api-reference/03-functions/get-static-paths.mdx) (12.3KB)
      - [get-static-props.mdx](.next-docs/02-pages/04-api-reference/03-functions/get-static-props.mdx) (12.6KB)
      - [index.mdx](.next-docs/02-pages/04-api-reference/03-functions/index.mdx) (0.4KB)
      - [next-request.mdx](.next-docs/02-pages/04-api-reference/03-functions/next-request.mdx) (0.4KB)
      - [next-response.mdx](.next-docs/02-pages/04-api-reference/03-functions/next-response.mdx) (0.4KB)
      - [use-amp.mdx](.next-docs/02-pages/04-api-reference/03-functions/use-amp.mdx) (2.4KB)
      - [use-report-web-vitals.mdx](.next-docs/02-pages/04-api-reference/03-functions/use-report-web-vitals.mdx) (0.4KB)
      - [use-router.mdx](.next-docs/02-pages/04-api-reference/03-functions/use-router.mdx) (20.0KB)
      - [userAgent.mdx](.next-docs/02-pages/04-api-reference/03-functions/userAgent.mdx) (0.5KB)
    - **04-config/**:
      - [01-typescript.mdx](.next-docs/02-pages/04-api-reference/04-config/01-typescript.mdx) (0.5KB)
      - [02-eslint.mdx](.next-docs/02-pages/04-api-reference/04-config/02-eslint.mdx) (0.5KB)
      - [index.mdx](.next-docs/02-pages/04-api-reference/04-config/index.mdx) (0.1KB)
      - **01-next-config-js/**:
        - [allowedDevOrigins.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/allowedDevOrigins.mdx) (0.5KB)
        - [assetPrefix.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/assetPrefix.mdx) (0.5KB)
        - [basePath.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/basePath.mdx) (0.5KB)
        - [bundlePagesRouterDependencies.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/bundlePagesRouterDependencies.mdx) (1.0KB)
        - [compress.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/compress.mdx) (0.6KB)
        - [crossOrigin.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/crossOrigin.mdx) (0.5KB)
        - [devIndicators.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/devIndicators.mdx) (0.5KB)
        - [distDir.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/distDir.mdx) (0.5KB)
        - [env.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/env.mdx) (0.5KB)
        - [eslint.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/eslint.mdx) (0.5KB)
        - [exportPathMap.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/exportPathMap.mdx) (0.5KB)
        - [generateBuildId.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/generateBuildId.mdx) (0.5KB)
        - [generateEtags.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/generateEtags.mdx) (0.5KB)
        - [headers.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/headers.mdx) (0.5KB)
        - [httpAgentOptions.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/httpAgentOptions.mdx) (0.5KB)
        - [images.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/images.mdx) (0.5KB)
        - [index.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/index.mdx) (0.5KB)
        - [middlewareClientMaxBodySize.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/middlewareClientMaxBodySize.mdx) (0.5KB)
        - [onDemandEntries.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/onDemandEntries.mdx) (0.5KB)
        - [optimizePackageImports.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/optimizePackageImports.mdx) (0.5KB)
        - [output.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/output.mdx) (0.5KB)
        - [pageExtensions.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/pageExtensions.mdx) (0.5KB)
        - [poweredByHeader.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/poweredByHeader.mdx) (0.5KB)
        - [productionBrowserSourceMaps.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/productionBrowserSourceMaps.mdx) (0.5KB)
        - [reactStrictMode.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/reactStrictMode.mdx) (0.5KB)
        - [redirects.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/redirects.mdx) (0.4KB)
        - [rewrites.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/rewrites.mdx) (0.4KB)
        - [runtime-configuration.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/runtime-configuration.mdx) (2.5KB)
        - [serverExternalPackages.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/serverExternalPackages.mdx) (2.0KB)
        - [trailingSlash.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/trailingSlash.mdx) (0.5KB)
        - [transpilePackages.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/transpilePackages.mdx) (0.6KB)
        - [turbo.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/turbo.mdx) (0.5KB)
        - [typescript.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/typescript.mdx) (0.5KB)
        - [urlImports.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/urlImports.mdx) (0.5KB)
        - [useLightningcss.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/useLightningcss.mdx) (0.5KB)
        - [webpack.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/webpack.mdx) (0.5KB)
        - [webVitalsAttribution.mdx](.next-docs/02-pages/04-api-reference/04-config/01-next-config-js/webVitalsAttribution.mdx) (0.5KB)
    - **05-cli/**:
      - [create-next-app.mdx](.next-docs/02-pages/04-api-reference/05-cli/create-next-app.mdx) (0.5KB)
      - [index.mdx](.next-docs/02-pages/04-api-reference/05-cli/index.mdx) (0.4KB)
      - [next.mdx](.next-docs/02-pages/04-api-reference/05-cli/next.mdx) (0.5KB)
- **03-architecture/**:
  - [accessibility.mdx](.next-docs/03-architecture/accessibility.mdx) (2.8KB)
  - [fast-refresh.mdx](.next-docs/03-architecture/fast-refresh.mdx) (5.6KB)
  - [index.mdx](.next-docs/03-architecture/index.mdx) (0.1KB)
  - [nextjs-compiler.mdx](.next-docs/03-architecture/nextjs-compiler.mdx) (14.2KB)
  - [supported-browsers.mdx](.next-docs/03-architecture/supported-browsers.mdx) (2.9KB)
- **04-community/**:
  - [01-contribution-guide.mdx](.next-docs/04-community/01-contribution-guide.mdx) (18.5KB)
  - [02-rspack.mdx](.next-docs/04-community/02-rspack.mdx) (0.6KB)
  - [index.mdx](.next-docs/04-community/index.mdx) (1.7KB)

**Usage**: Reference these files when answering Next.js-related questions. The files contain comprehensive documentation for Next.js features, APIs, and best practices.

**Last Updated**: 2026-02-12T15:50:53.543Z

<!-- NEXTJS-DOCS-END -->

<!-- PAYLOAD-DOCS-START -->

## Payload CMS Documentation Index (v3.74.0)

The following Payload CMS documentation files are available in the `.payload-docs/` directory:

- **access-control/**:
  - [collections.mdx](.payload-docs/access-control/collections.mdx) (13.7KB)
  - [fields.mdx](.payload-docs/access-control/fields.mdx) (5.6KB)
  - [globals.mdx](.payload-docs/access-control/globals.mdx) (5.8KB)
  - [overview.mdx](.payload-docs/access-control/overview.mdx) (4.7KB)
- **admin/**:
  - [accessibility.mdx](.payload-docs/admin/accessibility.mdx) (1.8KB)
  - [customizing-css.mdx](.payload-docs/admin/customizing-css.mdx) (4.5KB)
  - [locked-documents.mdx](.payload-docs/admin/locked-documents.mdx) (4.4KB)
  - [metadata.mdx](.payload-docs/admin/metadata.mdx) (9.7KB)
  - [overview.mdx](.payload-docs/admin/overview.mdx) (21.0KB)
  - [preferences.mdx](.payload-docs/admin/preferences.mdx) (6.3KB)
  - [preview.mdx](.payload-docs/admin/preview.mdx) (8.5KB)
  - [react-hooks.mdx](.payload-docs/admin/react-hooks.mdx) (42.5KB)
- **authentication/**:
  - [api-keys.mdx](.payload-docs/authentication/api-keys.mdx) (4.0KB)
  - [cookies.mdx](.payload-docs/authentication/cookies.mdx) (5.0KB)
  - [custom-strategies.mdx](.payload-docs/authentication/custom-strategies.mdx) (3.8KB)
  - [email.mdx](.payload-docs/authentication/email.mdx) (8.4KB)
  - [jwt.mdx](.payload-docs/authentication/jwt.mdx) (2.2KB)
  - [operations.mdx](.payload-docs/authentication/operations.mdx) (12.6KB)
  - [overview.mdx](.payload-docs/authentication/overview.mdx) (13.6KB)
  - [token-data.mdx](.payload-docs/authentication/token-data.mdx) (2.4KB)
- **configuration/**:
  - [collections.mdx](.payload-docs/configuration/collections.mdx) (31.0KB)
  - [environment-vars.mdx](.payload-docs/configuration/environment-vars.mdx) (3.3KB)
  - [globals.mdx](.payload-docs/configuration/globals.mdx) (14.2KB)
  - [i18n.mdx](.payload-docs/configuration/i18n.mdx) (8.7KB)
  - [localization.mdx](.payload-docs/configuration/localization.mdx) (13.7KB)
  - [overview.mdx](.payload-docs/configuration/overview.mdx) (20.9KB)
- **custom-components/**:
  - [custom-providers.mdx](.payload-docs/custom-components/custom-providers.mdx) (1.7KB)
  - [custom-views.mdx](.payload-docs/custom-components/custom-views.mdx) (14.7KB)
  - [dashboard.mdx](.payload-docs/custom-components/dashboard.mdx) (5.0KB)
  - [document-views.mdx](.payload-docs/custom-components/document-views.mdx) (7.6KB)
  - [edit-view.mdx](.payload-docs/custom-components/edit-view.mdx) (21.0KB)
  - [list-view.mdx](.payload-docs/custom-components/list-view.mdx) (9.6KB)
  - [overview.mdx](.payload-docs/custom-components/overview.mdx) (21.9KB)
  - [root-components.mdx](.payload-docs/custom-components/root-components.mdx) (15.0KB)
- **database/**:
  - [indexes.mdx](.payload-docs/database/indexes.mdx) (2.2KB)
  - [migrations.mdx](.payload-docs/database/migrations.mdx) (13.7KB)
  - [mongodb.mdx](.payload-docs/database/mongodb.mdx) (9.3KB)
  - [overview.mdx](.payload-docs/database/overview.mdx) (4.0KB)
  - [postgres.mdx](.payload-docs/database/postgres.mdx) (12.9KB)
  - [sqlite.mdx](.payload-docs/database/sqlite.mdx) (15.1KB)
  - [transactions.mdx](.payload-docs/database/transactions.mdx) (5.2KB)
- **ecommerce/**:
  - [advanced.mdx](.payload-docs/ecommerce/advanced.mdx) (24.2KB)
  - [frontend.mdx](.payload-docs/ecommerce/frontend.mdx) (21.8KB)
  - [overview.mdx](.payload-docs/ecommerce/overview.mdx) (5.7KB)
  - [payments.mdx](.payload-docs/ecommerce/payments.mdx) (21.1KB)
  - [plugin.mdx](.payload-docs/ecommerce/plugin.mdx) (39.9KB)
- **email/**:
  - [overview.mdx](.payload-docs/email/overview.mdx) (11.1KB)
- **examples/**:
  - [overview.mdx](.payload-docs/examples/overview.mdx) (1.7KB)
- **fields/**:
  - [array.mdx](.payload-docs/fields/array.mdx) (12.7KB)
  - [blocks.mdx](.payload-docs/fields/blocks.mdx) (24.1KB)
  - [checkbox.mdx](.payload-docs/fields/checkbox.mdx) (8.4KB)
  - [code.mdx](.payload-docs/fields/code.mdx) (10.5KB)
  - [collapsible.mdx](.payload-docs/fields/collapsible.mdx) (3.4KB)
  - [date.mdx](.payload-docs/fields/date.mdx) (17.4KB)
  - [email.mdx](.payload-docs/fields/email.mdx) (9.4KB)
  - [group.mdx](.payload-docs/fields/group.mdx) (9.5KB)
  - [join.mdx](.payload-docs/fields/join.mdx) (16.6KB)
  - [json.mdx](.payload-docs/fields/json.mdx) (12.0KB)
  - [number.mdx](.payload-docs/fields/number.mdx) (11.2KB)
  - [overview.mdx](.payload-docs/fields/overview.mdx) (46.9KB)
  - [point.mdx](.payload-docs/fields/point.mdx) (10.1KB)
  - [radio.mdx](.payload-docs/fields/radio.mdx) (10.9KB)
  - [relationship.mdx](.payload-docs/fields/relationship.mdx) (20.1KB)
  - [rich-text.mdx](.payload-docs/fields/rich-text.mdx) (7.2KB)
  - [row.mdx](.payload-docs/fields/row.mdx) (2.3KB)
  - [select.mdx](.payload-docs/fields/select.mdx) (14.0KB)
  - [tabs.mdx](.payload-docs/fields/tabs.mdx) (5.3KB)
  - [text.mdx](.payload-docs/fields/text.mdx) (16.0KB)
  - [textarea.mdx](.payload-docs/fields/textarea.mdx) (10.8KB)
  - [ui.mdx](.payload-docs/fields/ui.mdx) (3.1KB)
  - [upload.mdx](.payload-docs/fields/upload.mdx) (13.4KB)
- **folders/**:
  - [overview.mdx](.payload-docs/folders/overview.mdx) (3.0KB)
- **getting-started/**:
  - [concepts.mdx](.payload-docs/getting-started/concepts.mdx) (9.1KB)
  - [installation.mdx](.payload-docs/getting-started/installation.mdx) (7.5KB)
  - [what-is-payload.mdx](.payload-docs/getting-started/what-is-payload.mdx) (9.2KB)
- **graphql/**:
  - [extending.mdx](.payload-docs/graphql/extending.mdx) (5.7KB)
  - [graphql-schema.mdx](.payload-docs/graphql/graphql-schema.mdx) (2.2KB)
  - [overview.mdx](.payload-docs/graphql/overview.mdx) (7.6KB)
- **hooks/**:
  - [collections.mdx](.payload-docs/hooks/collections.mdx) (31.6KB)
  - [context.mdx](.payload-docs/hooks/context.mdx) (5.0KB)
  - [fields.mdx](.payload-docs/hooks/fields.mdx) (14.2KB)
  - [globals.mdx](.payload-docs/hooks/globals.mdx) (13.3KB)
  - [overview.mdx](.payload-docs/hooks/overview.mdx) (8.7KB)
- **integrations/**:
  - [vercel-content-link.mdx](.payload-docs/integrations/vercel-content-link.mdx) (4.8KB)
- **jobs-queue/**:
  - [jobs.mdx](.payload-docs/jobs-queue/jobs.mdx) (7.8KB)
  - [overview.mdx](.payload-docs/jobs-queue/overview.mdx) (4.6KB)
  - [queues.mdx](.payload-docs/jobs-queue/queues.mdx) (13.9KB)
  - [quick-start-example.mdx](.payload-docs/jobs-queue/quick-start-example.mdx) (3.8KB)
  - [schedules.mdx](.payload-docs/jobs-queue/schedules.mdx) (13.8KB)
  - [tasks.mdx](.payload-docs/jobs-queue/tasks.mdx) (17.5KB)
  - [workflows.mdx](.payload-docs/jobs-queue/workflows.mdx) (21.8KB)
- **live-preview/**:
  - [client.mdx](.payload-docs/live-preview/client.mdx) (12.8KB)
  - [frontend.mdx](.payload-docs/live-preview/frontend.mdx) (0.7KB)
  - [overview.mdx](.payload-docs/live-preview/overview.mdx) (9.5KB)
  - [server.mdx](.payload-docs/live-preview/server.mdx) (7.2KB)
- **local-api/**:
  - [access-control.mdx](.payload-docs/local-api/access-control.mdx) (2.3KB)
  - [outside-nextjs.mdx](.payload-docs/local-api/outside-nextjs.mdx) (3.3KB)
  - [overview.mdx](.payload-docs/local-api/overview.mdx) (20.1KB)
  - [server-functions.mdx](.payload-docs/local-api/server-functions.mdx) (15.4KB)
- **migration-guide/**:
  - [overview.mdx](.payload-docs/migration-guide/overview.mdx) (35.4KB)
- **performance/**:
  - [overview.mdx](.payload-docs/performance/overview.mdx) (8.4KB)
- **plugins/**:
  - [build-your-own.mdx](.payload-docs/plugins/build-your-own.mdx) (10.4KB)
  - [form-builder.mdx](.payload-docs/plugins/form-builder.mdx) (25.8KB)
  - [import-export.mdx](.payload-docs/plugins/import-export.mdx) (24.6KB)
  - [mcp.mdx](.payload-docs/plugins/mcp.mdx) (16.9KB)
  - [multi-tenant.mdx](.payload-docs/plugins/multi-tenant.mdx) (12.1KB)
  - [nested-docs.mdx](.payload-docs/plugins/nested-docs.mdx) (10.1KB)
  - [overview.mdx](.payload-docs/plugins/overview.mdx) (6.9KB)
  - [redirects.mdx](.payload-docs/plugins/redirects.mdx) (5.0KB)
  - [search.mdx](.payload-docs/plugins/search.mdx) (9.4KB)
  - [sentry.mdx](.payload-docs/plugins/sentry.mdx) (5.5KB)
  - [seo.mdx](.payload-docs/plugins/seo.mdx) (11.5KB)
  - [stripe.mdx](.payload-docs/plugins/stripe.mdx) (13.1KB)
- **production/**:
  - [building-without-a-db-connection.mdx](.payload-docs/production/building-without-a-db-connection.mdx) (2.1KB)
  - [deployment.mdx](.payload-docs/production/deployment.mdx) (10.6KB)
  - [preventing-abuse.mdx](.payload-docs/production/preventing-abuse.mdx) (3.9KB)
- **queries/**:
  - [depth.mdx](.payload-docs/queries/depth.mdx) (3.3KB)
  - [overview.mdx](.payload-docs/queries/overview.mdx) (12.1KB)
  - [pagination.mdx](.payload-docs/queries/pagination.mdx) (5.3KB)
  - [select.mdx](.payload-docs/queries/select.mdx) (6.6KB)
  - [sort.mdx](.payload-docs/queries/sort.mdx) (3.3KB)
- **query-presets/**:
  - [overview.mdx](.payload-docs/query-presets/overview.mdx) (8.7KB)
- **rest-api/**:
  - [overview.mdx](.payload-docs/rest-api/overview.mdx) (28.3KB)
- **rich-text/**:
  - [blocks.mdx](.payload-docs/rich-text/blocks.mdx) (15.4KB)
  - [converters.mdx](.payload-docs/rich-text/converters.mdx) (3.7KB)
  - [converting-html.mdx](.payload-docs/rich-text/converting-html.mdx) (7.4KB)
  - [converting-jsx.mdx](.payload-docs/rich-text/converting-jsx.mdx) (5.8KB)
  - [converting-markdown.mdx](.payload-docs/rich-text/converting-markdown.mdx) (7.5KB)
  - [converting-plaintext.mdx](.payload-docs/rich-text/converting-plaintext.mdx) (1.9KB)
  - [custom-features.mdx](.payload-docs/rich-text/custom-features.mdx) (40.6KB)
  - [migration.mdx](.payload-docs/rich-text/migration.mdx) (10.5KB)
  - [official-features.mdx](.payload-docs/rich-text/official-features.mdx) (19.5KB)
  - [overview.mdx](.payload-docs/rich-text/overview.mdx) (11.8KB)
  - [rendering-on-demand.mdx](.payload-docs/rich-text/rendering-on-demand.mdx) (3.9KB)
  - [slate.mdx](.payload-docs/rich-text/slate.mdx) (12.4KB)
- **trash/**:
  - [overview.mdx](.payload-docs/trash/overview.mdx) (5.0KB)
- **troubleshooting/**:
  - [troubleshooting.mdx](.payload-docs/troubleshooting/troubleshooting.mdx) (8.6KB)
- **typescript/**:
  - [generating-types.mdx](.payload-docs/typescript/generating-types.mdx) (6.9KB)
  - [overview.mdx](.payload-docs/typescript/overview.mdx) (1.5KB)
- **upload/**:
  - [overview.mdx](.payload-docs/upload/overview.mdx) (41.6KB)
  - [storage-adapters.mdx](.payload-docs/upload/storage-adapters.mdx) (21.1KB)
- **versions/**:
  - [autosave.mdx](.payload-docs/versions/autosave.mdx) (4.0KB)
  - [drafts.mdx](.payload-docs/versions/drafts.mdx) (13.4KB)
  - [overview.mdx](.payload-docs/versions/overview.mdx) (11.9KB)

**Usage**: Reference these files when answering Payload CMS-related questions. The files contain comprehensive documentation for Payload CMS features, APIs, configuration, and best practices.

**Last Updated**: 2026-02-12T15:50:53.544Z

<!-- PAYLOAD-DOCS-END -->
