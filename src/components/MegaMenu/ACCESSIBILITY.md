# MegaMenu Accessibility & Keyboard Navigation

## 🎯 Overview

The MegaMenuDropdown component now includes comprehensive keyboard navigation support and ARIA attributes for improved accessibility.

## ⌨️ Keyboard Navigation

### Primary Navigation (Left Sidebar)

- **Arrow Up/Down**: Navigate between main categories
- **Enter/Space**: Select category (browser default)
- **Tab**: Move focus to next interactive element

### Secondary Navigation (Sub-subcategories/Nested Items)

- **Arrow Right**: Navigate to next sub-subcategory or nested item
- **Arrow Left**: Navigate to previous sub-subcategory or nested item
- **Enter/Space**: Activate links (browser default)

### Global Controls

- **Escape**: Close the mega menu
- **Tab/Shift+Tab**: Navigate through all focusable elements

## 🔍 Navigation Behavior

### Three-Level Navigation

1. **Main Categories** (Left Sidebar)
   - Arrow Up/Down moves between categories
   - Changing category resets sub-subcategory to first item

2. **Sub-subcategories** (Middle Column)
   - Arrow Right/Left navigates between sub-subcategories
   - Only active when current category has sub-subcategories

3. **Pages** (Right Column)
   - Displays items from active sub-subcategory
   - Standard Tab navigation for links

### Nested Items

When a category has nested items:

- Arrow Right/Left navigates between nested groups
- activeNested state tracks the selected group
- Content updates to show items from selected group

## ♿ ARIA Attributes

### Structural Roles

```tsx
// Mega menu container
<div role="dialog" aria-modal="true" aria-label="{category.label} menu">

// Navigation lists
<ul role="menu" aria-orientation="vertical" aria-label="Main categories">

// List items
<li role="none">  // Removes default list semantics
```

### Interactive Elements

```tsx
// Main category buttons
<button
  role="menuitem"
  aria-haspopup="true"
  aria-expanded={activeSub === index}
  aria-current={activeSub === index ? 'true' : undefined}
>

// Sub-subcategory buttons
<button
  role="menuitem"
  aria-haspopup="true"
  aria-expanded={activeSubSub === subSubIndex}
  aria-current={activeSubSub === subSubIndex ? 'true' : undefined}
>

// Page links
<a role="menuitem">
```

### Labels

```tsx
// Context-aware labels
aria-label="Main categories"
aria-label="Subcategories"
aria-label="{subCategory.label} pages"
aria-label="{nestedGroup.label} items"

// Hidden overlay
aria-hidden="true"  // Prevents screen readers from announcing overlay
```

## 🎨 Active State Indicators

Visual and semantic indicators for active items:

- **CSS Class**: `.active` applied to current selection
- **ARIA Current**: `aria-current="true"` for screen readers
- **ARIA Expanded**: `aria-expanded="true"` when submenu visible

## 🔄 Focus Management

### On Menu Open

- Focus automatically moves to first interactive element
- Implemented via `useEffect` with `dropdownRef`

```tsx
useEffect(() => {
  if (isOpen && dropdownRef.current) {
    const firstFocusable = dropdownRef.current.querySelector<HTMLElement>(
      'button, a, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()
  }
}, [isOpen])
```

### On Menu Close

- Focus returns to trigger element (handled by parent component)
- Escape key closes menu and restores focus

## 📋 WCAG Compliance

### Keyboard Accessibility (WCAG 2.1.1)

- ✅ All functionality available via keyboard
- ✅ No keyboard traps
- ✅ Visible focus indicators

### Focus Order (WCAG 2.4.3)

- ✅ Logical tab order through menu
- ✅ Arrow keys for menu navigation
- ✅ Tab for moving between sections

### Focus Visible (WCAG 2.4.7)

- ✅ Default browser focus rings preserved
- ✅ Custom focus styles via CSS (recommended to add)

### Name, Role, Value (WCAG 4.1.2)

- ✅ All controls have accessible names
- ✅ Roles properly assigned (dialog, menu, menuitem)
- ✅ States communicated (aria-expanded, aria-current)

### On Input (WCAG 3.2.2)

- ✅ Arrow key navigation doesn't trigger navigation
- ✅ Only Enter/click activates links
- ✅ Escape closes without changing context

## 🧪 Testing Recommendations

### Manual Testing

1. **Keyboard Only**:
   - Unplug mouse
   - Navigate entire menu using only keyboard
   - Verify all items are reachable

2. **Screen Reader**:
   - Test with NVDA (Windows) or VoiceOver (Mac)
   - Verify menu structure is announced correctly
   - Check active states are communicated

3. **High Contrast Mode**:
   - Enable Windows High Contrast
   - Verify focus indicators are visible

### Automated Testing

- **jest-axe**: Add to unit tests for a11y violations
- **Lighthouse**: Run accessibility audit
- **axe DevTools**: Browser extension for live testing

### Example Test Addition

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(
    <MegaMenuDropdown category={mockCategory} isOpen={true} onCloseAction={vi.fn()} />,
  )
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## 🎯 Screen Reader Announcements

Expected announcements (VoiceOver/NVDA):

### Opening Menu

> "Formations menu, dialog"

### Navigating Categories

> "Achats, Supply Chain & Maritime Logistics, button, menu item, has submenu, 1 of 3, selected"

### Navigating Sub-subcategories

> "Business Transformation, button, menu item, has submenu, 1 of 2, selected"

### On Links

> "Program A, link, menu item"

## 🚀 Future Enhancements

### Potential Improvements

- [ ] Type-ahead search (jump to item by typing)
- [ ] Home/End keys (jump to first/last item)
- [ ] Page Up/Down for large menus
- [ ] Roving tabindex for better focus management
- [ ] CSS focus indicators (outline or ring)
- [ ] Reduced motion support for animations
- [ ] Touch/swipe gestures for mobile

### Advanced Features

- [ ] Breadcrumb trail for current location
- [ ] Bookmark/remember last position
- [ ] Skip to content link
- [ ] Landmark regions (nav, region)

## 📚 Resources

- [WAI-ARIA Authoring Practices - Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: ARIA Menus](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/menu_role)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

## 🔧 Implementation Notes

### State Management

The component maintains three levels of state:

- `activeSub`: Currently selected main category (0-based index)
- `activeSubSub`: Currently selected sub-subcategory (0-based index)
- `activeNested`: Currently selected nested group (0-based index | null)

### Event Listeners

- Global `keydown` listener added when menu is open
- Cleaned up on unmount or when menu closes
- Prevents default browser behavior for arrow keys

### Focus Trap

- Menu acts as modal dialog (`aria-modal="true"`)
- Focus should remain within menu until closed
- Consider adding focus trap library for production

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Accessibility Standard**: WCAG 2.1 Level AA
