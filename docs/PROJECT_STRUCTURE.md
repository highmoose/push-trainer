# Project Structure Documentation

## Enterprise-Grade Frontend Architecture

This document outlines the new enterprise-grade folder structure for the Push Trainer application.

### 📁 Root Structure

```
Push/
├── 📁 app/                    # Next.js App Router (stays as-is)
├── 📁 src/                    # Source code (new organized structure)
├── 📁 public/                 # Static assets
├── 📁 docs/                   # Project documentation
├── 📁 config/                 # Configuration files
├── 📁 styles/                 # Global styles
└── 📄 [config files]          # Root config files
```

### 📁 src/ Directory Structure

#### 🧩 Components (`src/components/`)

```
src/components/
├── 📁 ui/                     # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── index.ts               # Barrel exports
├── 📁 features/               # Feature-specific components
│   ├── 📁 auth/               # Authentication components
│   ├── 📁 clients/            # Client management components
│   ├── 📁 nutrition/          # Nutrition plan components
│   ├── 📁 workouts/           # Workout plan components
│   └── 📁 messaging/          # Messaging components
├── 📁 layout/                 # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── Layout.tsx
└── 📁 common/                 # Common/shared components
    ├── DataTable.tsx
    ├── ConfirmationModal.tsx
    └── LoadingSpinner.tsx
```

#### 🪝 Hooks (`src/hooks/`)

```
src/hooks/
├── 📁 api/                    # API-related hooks
│   ├── useClients.ts
│   ├── useDietPlans.ts
│   ├── useAuth.ts
│   └── index.ts
├── 📁 features/               # Feature-specific hooks
│   ├── useClientSelection.ts
│   ├── useMessaging.ts
│   └── useDataPreloader.ts
└── 📁 utils/                  # Utility hooks
    ├── useLocalStorage.ts
    ├── useDebounce.ts
    └── useWindowSize.ts
```

#### 📚 Library (`src/lib/`)

```
src/lib/
├── 📁 api/                    # API layer
│   ├── client.ts              # API client configuration
│   ├── endpoints.ts           # API endpoints
│   └── types.ts               # API types
├── 📁 utils/                  # Utility functions
│   ├── formatting.ts
│   ├── validation.ts
│   ├── calculations.ts
│   └── constants.ts
├── 📁 auth/                   # Authentication utilities
│   ├── config.ts
│   └── helpers.ts
└── 📁 builders/               # Builder patterns
    ├── dietPromptBuilder.ts
    └── workoutBuilder.ts
```

#### 🗃️ Store (`src/store/`)

```
src/store/
├── 📁 slices/                 # Redux slices
│   ├── authSlice.ts
│   ├── clientSlice.ts
│   ├── dietPlanSlice.ts
│   └── index.ts
├── index.ts                   # Store configuration
├── hooks.ts                   # Typed hooks
└── middleware.ts              # Custom middleware
```

#### 📄 Pages (`src/pages/`)

```
src/pages/
├── 📁 trainer/                # Trainer-specific pages
│   ├── Dashboard.tsx
│   ├── Clients.tsx
│   ├── Nutrition.tsx
│   ├── Workouts.tsx
│   └── Messages.tsx
├── 📁 client/                 # Client-specific pages
└── 📁 shared/                 # Shared pages
```

#### 🏷️ Types (`src/types/`)

```
src/types/
├── api.ts                     # API response types
├── entities.ts                # Business entity types
├── components.ts              # Component prop types
└── index.ts                   # Barrel exports
```

### 📁 Documentation (`docs/`)

```
docs/
├── 📁 api/                    # API documentation
├── 📁 features/               # Feature documentation
├── 📁 deployment/             # Deployment guides
├── CONTRIBUTING.md            # Contribution guidelines
├── ARCHITECTURE.md            # Architecture overview
└── CHANGELOG.md               # Change log
```

### 📁 Configuration (`config/`)

```
config/
├── database.js                # Database configuration
├── api.js                     # API configuration
├── theme.js                   # UI theme configuration
└── constants.js               # Application constants
```

## Migration Benefits

### 🎯 Improved Organization

- **Feature-based architecture**: Related code is grouped together
- **Clear separation of concerns**: UI, business logic, and data are separated
- **Scalable structure**: Easy to add new features without cluttering

### 🔧 Developer Experience

- **Better IntelliSense**: Clearer import paths and auto-completion
- **Easier debugging**: Logical code organization makes issues easier to trace
- **Consistent patterns**: Standardized folder structure across features

### 🚀 Performance Benefits

- **Better tree-shaking**: Unused code is more easily eliminated
- **Optimized bundling**: Related code can be bundled together
- **Lazy loading**: Features can be loaded on-demand

### 🛡️ Maintainability

- **Single responsibility**: Each folder has a clear purpose
- **Reduced coupling**: Features are less dependent on each other
- **Easier testing**: Clear structure makes unit testing straightforward

## Next Steps

1. **Phase 1**: Move common components and utilities
2. **Phase 2**: Reorganize feature-specific components
3. **Phase 3**: Update import paths and barrel exports
4. **Phase 4**: Add TypeScript types and documentation
5. **Phase 5**: Optimize build configuration for new structure

## Import Path Updates

After migration, imports will follow these patterns:

```typescript
// UI Components
import { Button, Modal } from "@/components/ui";

// Feature Components
import { CreatePlanModal } from "@/components/features/nutrition";

// Hooks
import { useClients, useDietPlans } from "@/hooks/api";

// Utilities
import { formatCalories } from "@/lib/utils";

// Types
import type { Client, DietPlan } from "@/types";
```
