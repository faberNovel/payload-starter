# Quick Start: Running MegaMenu Unit Tests

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Run the Tests

```bash
# Run all unit tests once
pnpm test:unit

# Run unit tests in watch mode (recommended for development)
pnpm test:unit:watch

# Run all tests (unit + integration + e2e)
pnpm test
```

## 3. Expected Output

After installing dependencies, you should see:

```md
✓ src/components/MegaMenu/MegaMenuDropdown.test.tsx (50+ tests)
✓ Rendering (4)
✓ Sidebar Navigation (4)
✓ Click Navigation (4)
✓ Content Display (3)
✓ Sub-subcategories Navigation (5)
✓ Nested Items Navigation (4)
✓ CSS Classes (3)
✓ Badge Styles (2)
✓ Edge Cases (3)

Test Files 1 passed (1)
Tests 50+ passed (50+)
```

## Troubleshooting

### If tests fail with "toBeInTheDocument is not a function"

Make sure `@testing-library/jest-dom` is installed and imported in `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest'
```

### If component import fails

Verify the path alias is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### If vitest is not found

Make sure vitest is installed:

```bash
pnpm add -D vitest@latest
```

## What's Tested?

✅ All 3 navigation levels (Category → Subcategory → Sub-subcategory)
✅ User interactions (click, hover)
✅ State management (activeSub, activeSubSub, activeNested)
✅ Content reveal behavior
✅ CSS class application
✅ Badge/tag rendering
✅ Edge cases (null, undefined, empty arrays)
✅ Menu open/close logic

## Files Created

- `src/components/MegaMenu/MegaMenuDropdown.test.tsx` - Test file (534 lines)
- `src/components/MegaMenu/README.md` - Test documentation
- `UNIT_TESTS_SUMMARY.md` - Complete implementation summary

## Configuration Changes

- `vitest.config.mts` - Added `src/**/*.test.{ts,tsx}` pattern
- `vitest.setup.ts` - Added jest-dom import
- `package.json` - Added `test:unit` and `test:unit:watch` scripts

---

For detailed documentation, see [UNIT_TESTS_SUMMARY.md](./UNIT_TESTS_SUMMARY.md)
