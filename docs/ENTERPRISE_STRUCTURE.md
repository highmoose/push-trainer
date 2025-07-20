# Enterprise-Grade Project Structure

This document outlines the new enterprise-grade folder structure for the Push Trainer application.

## 📁 Project Structure Overview

```
Push/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API routes
│   ├── 📁 dashboard/                # Dashboard pages
│   ├── 📁 sign-in/                  # Authentication pages
│   ├── 📁 sign-up/
│   └── 📁 welcome/
│
├── 📁 src/                          # Source code (NEW)
│   ├── 📁 components/               # React components
│   │   ├── 📁 features/             # Feature-specific components
│   │   │   ├── 📁 auth/             # Authentication components
│   │   │   ├── 📁 clients/          # Client management components
│   │   │   ├── 📁 messaging/        # Chat/messaging components
│   │   │   ├── 📁 nutrition/        # Nutrition plan components
│   │   │   └── 📁 workouts/         # Workout components
│   │   ├── 📁 layout/               # Layout components (header, footer, etc.)
│   │   ├── 📁 common/               # Shared/common components
│   │   └── 📁 ui/                   # Base UI components (buttons, inputs, etc.)
│   │
│   ├── 📁 hooks/                    # Custom React hooks
│   │   ├── 📁 api/                  # API-related hooks
│   │   │   ├── 📁 auth/             # Authentication hooks
│   │   │   ├── 📁 clients/          # Client management hooks
│   │   │   ├── 📁 diet/             # Diet plan hooks
│   │   │   └── index.ts             # Barrel export
│   │   └── [other hooks]            # Non-API hooks
│   │
│   ├── 📁 lib/                      # Utility libraries
│   │   ├── 📁 api/                  # API client configurations
│   │   ├── 📁 builders/             # Builder functions (diet prompts, etc.)
│   │   └── 📁 utils/                # General utilities
│   │
│   ├── 📁 store/                    # Redux store (moved from redux/)
│   │   ├── 📁 slices/               # Redux slices
│   │   ├── index.js                 # Store configuration
│   │   └── hooks.js                 # Redux hooks
│   │
│   ├── 📁 pages/                    # Page components
│   │   └── 📁 trainer/              # Trainer role pages
│   │       ├── nutrition.js         # Nutrition management page
│   │       ├── clients.js           # Client management page
│   │       └── [other pages]
│   │
│   └── 📁 types/                    # TypeScript type definitions
│
├── 📁 config/                       # Configuration files
│   └── theme.js                     # UI theme configuration
│
├── 📁 docs/                         # Documentation
│   ├── 📁 features/                 # Feature-specific documentation
│   ├── MIGRATION_GUIDE.md           # Import path migration guide
│   └── STRATEGY_PLAN.md             # Project strategy
│
├── 📁 public/                       # Static assets
└── [config files]                   # Package.json, next.config.js, etc.
```

## 🎯 Design Principles

### 1. **Feature-Based Organization**

Components are organized by business domain (nutrition, clients, workouts) rather than technical concerns.

### 2. **Clear Separation of Concerns**

- `features/` - Business logic components
- `ui/` - Reusable UI components
- `common/` - Shared functionality
- `layout/` - Layout-specific components

### 3. **API Layer Abstraction**

All API-related hooks are centralized in `hooks/api/` with barrel exports for clean imports.

### 4. **Scalable Type System**

TypeScript types are centralized in `src/types/` for better reusability and maintenance.

### 5. **Configuration Centralization**

All configuration files are in the `config/` directory for easy management.

## 🔄 Import Path Mapping

The new structure uses path aliases for cleaner imports:

```javascript
// ✅ New imports
import { CreatePlanModal } from "@/features/nutrition";
import { useClients } from "@/api/clients";
import { buildDietPlanPrompt } from "@/builders/dietPromptBuilder";
import { Button } from "@/ui";
import { DataTable } from "@/common";

// ❌ Old imports (still supported for migration)
import { CreatePlanModal } from "@components/trainer/nutrition";
import { useClients } from "@hooks/clients";
```

This structure provides a solid foundation for scaling the application while maintaining code quality and developer experience.
