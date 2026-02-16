# Mega Menu Implementation Guide

## Overview

The mega menu has been successfully implemented following the KEDGE Business School design pattern. It provides a hierarchical dropdown navigation with:

- **Click-to-open** navigation (not hover)
- **Triangle indicator** (▼/▲) showing open/closed state
- **Two-panel layout**: Beige sidebar (30%) + White content area (70%)
- **Support for nested subcategories** and **badge system**

## Architecture

### Components Created

1. **`/src/Header/config.ts`** - Updated Payload config with `navCategories` field
2. **`/src/components/MegaMenu/MegaMenuDropdown.tsx`** - Main dropdown component
3. **`/src/components/MegaMenu/megaMenu.css`** - Complete styling
4. **`/src/Header/Nav/index.tsx`** - Updated navigation with click handling

## Data Structure

```typescript
NavCategory
├── label: string (e.g., "Formations")
└── subs: SubCategory[]
    ├── label: string (e.g., "Domaines de formation")
    ├── type: 'subcategory' | 'link'
    ├── link?: Link (for direct links)
    └── items?: PageItem[] (for subcategories)
        ├── label: string
        ├── type: 'page' | 'nested'
        ├── link?: Link (for pages)
        ├── tags?: Badge[] (for pages)
        │   ├── text: string
        │   └── style: 'default' | 'primary' | 'secondary'
        └── nestedItems?: NestedPage[] (for nested subcategories)
            ├── label: string
            ├── link: Link
            └── tags?: Badge[]
```

## Admin Configuration

### Step 1: Access Header Global

1. Go to Payload Admin: `http://localhost:3000/admin`
2. Navigate to **Globals → Header**

### Step 2: Add Mega Menu Categories

1. Scroll to **"Mega Menu Categories"** section
2. Click **"Add Mega Menu Categories"**

### Step 3: Configure a Category

#### Example: "Formations" Category

**Category Settings:**

- **Label**: `Formations`

**Add Subcategories:**

##### Subcategory 1: List of links

- **Label**: `Domaines de formation`
- **Type**: `Subcategory (has pages)`
- **Add Pages:**
  - **Page 1:**
    - Label: `Achats, Supply & Logistique`
    - Type: `Page`
    - Link: `/programmes/achat-supply-logistique`
  - **Page 2:**
    - Label: `Arts, design & creative industries`
    - Type: `Page`
    - Link: `/programmes/arts-design`

##### Subcategory 2: Direct link

- **Label**: `Programme Grande Ecole`
- **Type**: `Direct Link`
- **Link**: `/programmes/grande-ecole`

##### Subcategory 3: Nested subcategories with badges

- **Label**: `Programmes post-bac`
- **Type**: `Subcategory (has pages)`
- **Add Pages:**
  - **Page 1 (with nested subcategory):**
    - Label: `Bachelor Programs`
    - Type: `Nested Subcategory`
    - **Add Nested Pages:**
      - **Nested Page 1:**
        - Label: `Kedge Bachelor`
        - Link: `/programmes/bachelor`
        - **Add Badges:**
          - Text: `BAC+3`
          - Style: `Primary`
      - **Nested Page 2:**
        - Label: `International BBA`
        - Link: `/programmes/ibba`
        - **Add Badges:**
          - Text: `BAC+4`
          - Style: `Primary`
  - **Page 2 (with badges):**
    - Label: `Préparation au DCG`
    - Type: `Page`
    - Link: `/programmes/dcg`
    - **Add Badges:**
      - Text: `Alternance`
      - Style: `Default`
      - Text: `Temps plein`
      - Style: `Secondary`

## Badge Styles

- **Default** (`default`): Gray background - for general tags
- **Primary** (`primary`): Yellow background - for degree levels (BAC+3, BAC+4)
- **Secondary** (`secondary`): Blue background - for program types (Alternance, Temps plein)

## Features

### ✅ Implemented

- [x] Click-to-open dropdown (not hover)
- [x] Triangle indicator (▼ closed, ▲ open)
- [x] Two-panel layout (30% sidebar / 70% content)
- [x] Beige sidebar (#f5e6d3)
- [x] White content area
- [x] Nested subcategories support
- [x] Badge system with 3 styles
- [x] Responsive design
- [x] Hover highlighting in sidebar
- [x] Click outside to close
- [x] Smooth animations
- [x] Accessible markup (aria attributes)

### Behavior

1. **Click a category button** → Dropdown opens, triangle changes to ▲
2. **Click same button again** → Dropdown closes, triangle changes to ▼
3. **Click different category** → Switches to new category
4. **Click outside** → Closes dropdown
5. **Hover sidebar items** → Automatically switches content
6. **Click any link** → Closes dropdown and navigates

## Styling Customization

Edit `/src/components/MegaMenu/megaMenu.css` to customize:

```css
/* Sidebar background color */
.mega-menu-sidebar {
  background: #f5e6d3; /* Change to your brand color */
}

/* Badge colors */
.badge-primary {
  background: #fef3c7; /* Yellow */
  color: #92400e;
}

.badge-secondary {
  background: #dbeafe; /* Blue */
  color: #1e40af;
}
```

## Switching Between Mega Menu and Standard Navigation

The navigation automatically detects which mode to use:

- **If `navCategories` has items** → Shows mega menu
- **If `navCategories` is empty** → Shows standard `navItems` navigation

This allows you to switch modes without code changes.

## Example Configuration (Copy-Paste Ready)

### Simple Example: 2 Categories

**Category 1: "Programs"**

```
Label: Programs
Subs:
  - Label: Bachelor Programs
    Type: Subcategory
    Items:
      - Label: Business Administration
        Type: Page
        Link: /programs/business
        Tags:
          - Text: BAC+3
            Style: Primary
      - Label: International Management
        Type: Page
        Link: /programs/international
        Tags:
          - Text: BAC+4
            Style: Primary
          - Text: English
            Style: Secondary
```

**Category 2: "Admissions"**

```
Label: Admissions
Subs:
  - Label: How to Apply
    Type: Direct Link
    Link: /admissions/apply
  - Label: Requirements
    Type: Direct Link
    Link: /admissions/requirements
```

## Troubleshooting

### Mega menu doesn't appear

- Verify `navCategories` is not empty in Header global
- Check browser console for errors
- Ensure `pnpm generate:types` was run

### Links don't work

- Verify the `link` field is configured properly
- Check that you selected a page or entered a URL

### Badges don't show

- Make sure `type` is set to `Page` (not `Nested Subcategory`)
- Add at least one badge in the `tags` array

### Styling issues

- Check that `megaMenu.css` is imported correctly
- Clear browser cache
- Inspect with DevTools to see if CSS is loaded

## Testing Checklist

- [ ] Categories open/close on click
- [ ] Triangle indicator changes (▼/▲)
- [ ] Sidebar items highlight on hover
- [ ] Content updates when hovering sidebar
- [ ] Nested subcategories display correctly
- [ ] Badges appear with correct styles
- [ ] Links navigate properly
- [ ] Dropdown closes when clicking outside
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works (Tab, Enter)

## Next Steps

1. **Add content** in the admin panel following the examples above
2. **Test** all navigation paths
3. **Customize colors** in `megaMenu.css` to match your brand
4. **Add more categories** as needed
5. **Configure badges** for program types

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify types are generated: `pnpm generate:types`
3. Review the data structure in Payload Admin
4. Check that all required fields have values

## Architecture Notes

- **Server Component**: `Header/Component.tsx` fetches data
- **Client Component**: `Header/Nav/index.tsx` handles state and clicks
- **Dropdown Component**: `MegaMenu/MegaMenuDropdown.tsx` renders the UI
- **Type-safe**: All data structures use generated Payload types
- **Accessible**: Proper ARIA attributes for screen readers
- **Performant**: CSS animations, efficient React rendering
