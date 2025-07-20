# Migration Guide: Import Path Updates

This guide helps you update import paths to work with the new enterprise-grade folder structure.

## Path Mapping Changes

### Before vs After

| Component Type       | Old Path                                 | New Path                       |
| -------------------- | ---------------------------------------- | ------------------------------ |
| Nutrition Components | `@components/trainer/nutrition`          | `@/features/nutrition`         |
| Diet Prompt Builder  | `@components/builders/dietPromptBuilder` | `@/builders/dietPromptBuilder` |
| Common Components    | `@components/common`                     | `@/common`                     |
| Layout Components    | `@components/layout`                     | `@/layout`                     |
| API Hooks            | `@hooks/diet`                            | `@/api/diet`                   |
| Client Hooks         | `@hooks/clients`                         | `@/api/clients`                |
| Auth Hooks           | `@hooks/auth`                            | `@/api/auth`                   |
| Redux Store          | `@redux/store`                           | `@/store`                      |
| Redux Slices         | `@redux/slices`                          | `@/store/slices`               |
| Utilities            | `@lib/utils`                             | `@/utils`                      |
| Configuration        | `heroUITheme.js`                         | `@/config/theme`               |

## Required Import Updates

### 1. Update CreatePlanModal.js

**Current imports to update:**

```javascript
// OLD
import {
  buildDietPlanPrompt,
  DIET_PLAN_TYPES,
} from "../../builders/dietPromptBuilder";

// NEW
import {
  buildDietPlanPrompt,
  DIET_PLAN_TYPES,
} from "@/builders/dietPromptBuilder";
```

### 2. Update nutrition.js

**Current imports to update:**

```javascript
// OLD
import {
  CreatePlanModal,
  PlanDetailsModal,
} from "@/components/trainer/nutrition";

// NEW
import { CreatePlanModal, PlanDetailsModal } from "@/features/nutrition";
```

### 3. Update hook imports

**API Hooks:**

```javascript
// OLD
import { useClients } from "@/hooks/clients";
import { useDietPlans } from "@/hooks/diet";

// NEW
import { useClients, useDietPlans } from "@/api";
// or
import { useClients } from "@/api/clients";
import { useDietPlans } from "@/api/diet";
```

### 4. Update Redux imports

**Store and slices:**

```javascript
// OLD
import { store } from "@redux/store";
import { clientSlice } from "@redux/slices/clientSlice";

// NEW
import { store } from "@/store";
import { clientSlice } from "@/store/slices/clientSlice";
```

### 5. Update utility imports

**Utilities and helpers:**

```javascript
// OLD
import { axios } from "@lib/axios";
import { clearAllCaches } from "@lib/clearAllCaches";

// NEW
import { axios } from "@/lib/axios";
import { clearAllCaches } from "@/lib/clearAllCaches";
```

## Automated Migration Script

You can use this PowerShell script to automatically update import paths:

```powershell
# Update import paths in all JavaScript/TypeScript files
Get-ChildItem -Path "." -Recurse -Include "*.js", "*.jsx", "*.ts", "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw

    # Update nutrition components
    $content = $content -replace '@components/trainer/nutrition', '@/features/nutrition'

    # Update builders
    $content = $content -replace '@components/builders', '@/builders'

    # Update common components
    $content = $content -replace '@components/common', '@/common'

    # Update layout components
    $content = $content -replace '@components/layout', '@/layout'

    # Update hooks
    $content = $content -replace '@hooks/diet', '@/api/diet'
    $content = $content -replace '@hooks/clients', '@/api/clients'
    $content = $content -replace '@hooks/auth', '@/api/auth'

    # Update Redux
    $content = $content -replace '@redux/store', '@/store'
    $content = $content -replace '@redux/slices', '@/store/slices'

    # Update lib
    $content = $content -replace '@lib/', '@/lib/'

    Set-Content $_.FullName $content
}
```

## Manual Updates Required

### 1. App Router Files

Next.js app router files in the `app/` directory will need manual updates since they should continue to reference the source files.

### 2. Configuration Files

Update any configuration files that reference the old paths:

- `next.config.mjs`
- `tailwind.config.js`
- Any build scripts

### 3. Type Definitions

Create proper TypeScript type definitions in `src/types/` for better type safety.

## Verification Steps

1. **Check imports**: Ensure all imports resolve correctly
2. **Run build**: Execute `npm run build` to verify no broken imports
3. **Test features**: Manually test key features to ensure functionality works
4. **Update tests**: Update any test files with new import paths

## Benefits After Migration

- ✅ **Better organization**: Related code is grouped together
- ✅ **Clearer imports**: Shorter, more semantic import paths
- ✅ **Better IntelliSense**: Improved auto-completion and navigation
- ✅ **Easier maintenance**: Standardized structure across features
- ✅ **Future-proof**: Scalable architecture for new features

## Rollback Plan

If issues arise, you can temporarily use both old and new paths since the jsconfig.json includes legacy path mappings. This allows for gradual migration.

To rollback completely:

1. Restore the old folder structure
2. Revert jsconfig.json changes
3. Update imports back to original paths
