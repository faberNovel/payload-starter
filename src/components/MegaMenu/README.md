# MegaMenu Component Tests

## Overview

This directory contains the MegaMenuDropdown component and its comprehensive unit tests. The tests verify all navigation logic, state management, and user interactions for the three-level mega menu system.

## Running Tests

### Prerequisites

Ensure you have all dependencies installed:

```bash
pnpm install
```

### Test Commands

```bash
# Run all unit tests
pnpm test:unit

# Run unit tests in watch mode
pnpm test:unit:watch

# Run all tests (unit + integration)
pnpm test
```

## Test Coverage

The `MegaMenuDropdown.test.tsx` file includes comprehensive test suites covering:

### 1. Rendering Behavior

- ✅ Component visibility based on `isOpen` prop
- ✅ Handling empty/null category data
- ✅ Overlay rendering

### 2. Sidebar Navigation

- ✅ Rendering all subcategories
- ✅ Direct link rendering
- ✅ Button rendering for subcategories
- ✅ Active state on first subcategory by default

### 3. Click Navigation

- ✅ Changing active subcategory on click
- ✅ Changing active subcategory on mouse enter
- ✅ Closing menu via overlay click
- ✅ Closing menu when clicking links

### 4. Content Display

- ✅ Displaying items from active subcategory
- ✅ Displaying tags/badges
- ✅ Content updates when changing subcategories

### 5. Sub-subcategories Navigation

- ✅ Rendering sub-subcategories in nested sidebar
- ✅ Active state management for sub-subcategories
- ✅ Content display based on active sub-subcategory
- ✅ State reset when changing main categories

### 6. Nested Items Navigation

- ✅ Rendering nested item groups
- ✅ Initial collapsed state
- ✅ Expanding nested items on click
- ✅ Active state for selected nested groups

### 7. CSS Classes

- ✅ Correct CSS class application for layouts
- ✅ Grid layout for simple structures
- ✅ Page list layout for sub-subcategories
- ✅ Nested layout for nested items

### 8. Badge Styles

- ✅ Primary badge styling
- ✅ Secondary badge styling
- ✅ Default badge styling

### 9. Edge Cases

- ✅ Null `subs` array handling
- ✅ Null tags handling
- ✅ Empty tags array handling

## Test Structure

Each test suite follows this pattern:

```typescript
describe('Feature Area', () => {
  it('should behave in expected way', () => {
    // Arrange: Setup component with mock data
    render(<MegaMenuDropdown {...props} />)

    // Act: Perform user interaction
    fireEvent.click(element)

    // Assert: Verify expected outcome
    expect(result).toBe(expected)
  })
})
```

## Mock Data

The tests use realistic mock data structures that match the Payload CMS schema:

- **mockCategory**: Basic category with subcategories and pages
- **mockCategoryWithSubSubs**: Category with sub-subcategories
- **mockCategoryWithNested**: Category with nested page items

## Component Mocking

The tests mock the `CMSLink` component to avoid dependency complexity:

```typescript
vi.mock('@/components/Link', () => ({
  CMSLink: ({ children, className, onClick }: any) => (
    <a className={className} onClick={onClick} href="#mock">
      {children}
    </a>
  ),
}))
```

## Type Safety

All test data is properly typed matching the component's TypeScript interfaces, ensuring tests accurately reflect production usage.

## Adding New Tests

When adding new features to MegaMenuDropdown:

1. Add corresponding test cases in the appropriate `describe` block
2. Use realistic mock data that matches Payload CMS schemas
3. Test both happy path and edge cases
4. Verify accessibility (ARIA attributes, keyboard navigation)
5. Run tests in watch mode during development

## Debugging Tests

To debug failing tests:

```bash
# Run tests in watch mode
pnpm test:unit:watch

# Run specific test file
pnpm vitest src/components/MegaMenu/MegaMenuDropdown.test.tsx

# Run with UI
pnpm vitest --ui
```

## CI/CD Integration

The unit tests are automatically run as part of the main test script:

```json
{
  "scripts": {
    "test": "pnpm run test:unit && pnpm run test:int"
  }
}
```

This ensures all tests pass before deployment.
