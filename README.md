# Cansche: High-Throughput Component-Based Calendar & Productivity Core

A high-productivity personal planning system designed for batch scheduling, component-based event templating, multi-layer calendar composition, and intelligent constraint validation. Cansche models time allocation using paradigms inspired by visual design systems (Figma Components) and spreadsheet calculation engines.

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. System Architecture and Core Concepts](#2-system-architecture-and-core-concepts)
  - [2.1 Component-Based Models and Inheritance](#21-component-based-models-and-inheritance)
  - [2.2 Calendar Events and Checklist State](#22-calendar-events-and-checklist-state)
  - [2.3 Multi-Calendar Layer Composition](#23-multi-calendar-layer-composition)
  - [2.4 Command Pattern and Undo/Redo Engine](#24-command-pattern-and-undoredo-engine)
  - [2.5 Productivity Core (V1.3 Features)](#25-productivity-core-v13-features)
- [3. Repository Structure](#3-repository-structure)
- [4. Prerequisites and Environment](#4-prerequisites-and-environment)
- [5. Installation](#5-installation)
- [6. Running and Building the Application](#6-running-and-building-the-application)
  - [6.1 Web Development & Build](#61-web-development--build)
  - [6.2 Desktop Build (Windows .exe / .msi)](#62-desktop-build-windows-exe--msi)
- [7. Testing and Verification](#7-testing-and-verification)
- [8. Data Exchange Format Specification (`.cansche.json`)](#8-data-exchange-format-specification-canschejson)
- [9. Development & Architecture Guidelines](#9-development--architecture-guidelines)
- [10. License](#10-license)

---

## 1. Overview

Traditional digital calendar software relies on individual event creation forms, making bulk scheduling across multi-week or multi-month intervals inefficient. Cansche addresses this limitation by introducing batch selection algorithms, reusable master component templates (Models), layer-based composition, and intelligent event dependency tracking.

Key functional capabilities include:
- **Batch Range Selection**: Select single dates, arbitrary date spans, or programmatic patterns (e.g., all Saturdays, all weekends).
- **Master Templates (Models)**: Define reusable schedule templates containing time allocations, locations, categories, tags, priority levels, and default checklist procedures.
- **Favorites & Usage Metrics (★)**: Star favorite models to keep them pinned at the top of the library, sorted by usage frequency and recency.
- **Command Palette (`Ctrl+K`)**: Raycast-style keyboard-driven palette to execute any system command, search models, or jump to dates instantly.
- **Task Dependency Graph**: Model task dependencies (`finish-start`, `start-start`, `finish-finish`) with real-time **cycle detection** preventing circular dependencies (`A -> B -> A`).
- **Constraint Validation**: Define weekday rules (`WeekdayConstraint`) and weekly/monthly quotas (`CountConstraint`) for intelligent schedule enforcement.
- **Layered Composition**: Overlap multiple calendar layers (e.g., Academic, Work, Personal) onto a single high-density monthly view without merging underlying data models.
- **Cross-Platform**: Runs in web browsers and natively as a desktop application on Windows (via Tauri v2).

---

## 2. System Architecture and Core Concepts

### 2.1 Component-Based Models and Inheritance

In Cansche, a **Model** represents a reusable master configuration schema. Models encapsulate default properties, tags, priority, and constraints:

```typescript
export interface Model {
  id: string;
  name: string;
  emoji: string;
  color: string;
  favorite?: boolean;
  usageCount?: number;
  lastUsed?: string;
  tags?: string[]; // Array of Tag IDs
  priority?: 'low' | 'medium' | 'high';
  constraints?: ModelConstraint[];
  schedule?: {
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };
  metadata?: {
    category?: string;
    tags?: string[];
  };
  content?: {
    description?: string;
    location?: string;
    checklistTemplate?: string[];
  };
}
```

### 2.2 Calendar Events and Checklist State

When a Model is applied to one or more dates, a `CalendarEvent` instance is created inside `calendar.events`:

- **Inheritance**: Unmodified fields fall back dynamically to the parent `Model` definition.
- **Overrides**: Specific date instances can override properties (e.g., location or custom start time) without breaking the reference link.
- **Isolated Checklist State**: Each event maintains a date-specific completion state (`checklistState: ChecklistItem[]`).

```typescript
export interface CalendarEvent {
  id: string;
  date: ISODate;
  modelId?: string;
  source: 'model' | 'manual' | 'google';
  overrides?: EventOverrides;
  checklistState: ChecklistItem[];
  createdAt: string;
  modifiedAt?: string;
}
```

### 2.3 Multi-Calendar Layer Composition

The system structures user data inside a top-level `Workspace` container holding a collection of `Calendar` layers.

- `activeCalendarIds: string[]`: Defines the active set of calendar layers rendered simultaneously on the grid.
- `editingCalendarId: string`: Designates the target calendar layer currently selected to receive new model applications.

### 2.4 Command Pattern and Undo/Redo Engine

All state mutations in Cansche execute via encapsulated commands implementing the `Command` interface:

```typescript
export interface Command {
  description: string;
  execute(context: EngineContext): void;
  undo(context: EngineContext): void;
}
```

Command operations (such as `ApplyModelCommand`, `ClearCellsCommand`, `MoveCommand`, `ToggleFavoriteCommand`, and `PasteCommand`) support deterministic undo/redo history stacks and multi-date clipboard buffers with relative day offsets and non-destructive event merging.

### 2.5 Productivity Core (V1.3 Features)

- **DependencyGraph**: Managed in `@cansche/engine`, uses Depth-First Search (DFS) recursion stack tracking to reject dependency loops (`A -> B -> A`).
- **ConstraintValidator**: Validates model rules (`WeekdayConstraint`, `CountConstraint`) prior to applying or moving events.
- **Desktop Pointer Drag & Drop**: Smooth 6px threshold drag-and-drop service (`DragService`) supporting hover previews and `Ctrl` copy mode.

---

## 3. Repository Structure

Cansche is implemented as a monorepo managed via `pnpm` workspaces.

```
.
├── apps/
│   ├── web/                   # Vue 3 + Vite + Tailwind CSS Single Page Application
│   └── desktop/               # Tauri v2 + Rust Multi-Platform Desktop Application
├── packages/
│   ├── api/                   # High-level reactive API facade (CalendarAPI)
│   ├── domain/                # Pure TypeScript domain interfaces and type definitions
│   ├── engine/                # Core execution engine, Command pattern, History, I/O, DependencyGraph
│   ├── platform/              # Platform abstraction adapters (Web & Desktop)
│   ├── repositories/          # LocalStorage & IndexedDB repository implementations
│   ├── selection/             # Selection service and batch filtering algorithms
│   └── shared/                # Pure ISO-date utility functions and ID generators
├── DESIGN.md                  # Comprehensive design system reference manual
├── package.json               # Root workspace configuration
└── pnpm-workspace.yaml        # Workspace package boundaries
```

---

## 4. Prerequisites and Environment

Ensure your local development environment meets the following requirements:

- **Node.js**: Version 20.0.0 LTS or higher (Node.js 22 LTS recommended).
- **Package Manager**: `pnpm` version 9.0.0 or higher.
- **Rust / Tauri CLI** (for Desktop builds): Rust 1.75+ and Windows C++ build tools (MSVC).

---

## 5. Installation

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/user/cansche.git
cd cansche
pnpm install
```

---

## 6. Running and Building the Application

### 6.1 Web Development & Build

To start the Vite development server with hot-module replacement (HMR):

```bash
pnpm dev
```

To type-check and compile all workspace packages:

```bash
pnpm build
```

### 6.2 Desktop Build (Windows .exe / .msi)

To generate production-ready desktop installers for Windows:

```bash
pnpm --filter desktop tauri build
```

The output installers will be generated at:
- **`.exe` (NSIS Installer)**: `apps/desktop/src-tauri/target/release/bundle/nsis/`
- **`.msi` (Windows Installer)**: `apps/desktop/src-tauri/target/release/bundle/msi/`

---

## 7. Testing and Verification

Unit and integration tests are powered by Vitest across all monorepo packages.

To run the full automated test suite:

```bash
pnpm test
```

---

## 8. Data Exchange Format Specification (`.cansche.json`)

Cansche specifies a standardized JSON schema for calendar and workspace serialization (`.cansche.json`).

```typescript
export interface CanscheFile {
  format: 'cansche';
  version: 1;
  type: 'calendar' | 'workspace';
  metadata: {
    createdAt: string;
    updatedAt: string;
    appVersion: string;
  };
  data: Calendar | Workspace;
}
```

---

## 9. Development & Architecture Guidelines

### 9.1 Pure Package Boundaries Rule

To maintain strict architectural decoupling, packages inside `packages/` must remain **100% free of UI framework code (Vue)**:

- `packages/domain`: ❌ No Vue imports
- `packages/engine`: ❌ No Vue imports
- `packages/application`: ❌ No Vue imports (pure application I/O, backup, notification services)
- `packages/repositories`: ❌ No Vue imports
- `apps/web/src/services`: ✅ Reactive UI services (`CommandPaletteService`, `DragService`, `InspectorService`)

### 9.2 Package Boundaries

Dependency flow must remain strictly unidirectional:

```
apps/web -> packages/api -> packages/engine -> packages/selection -> packages/domain -> packages/shared
```

---

## 10. License

This project is licensed under the Apache License 2.0. See the `LICENSE` file for details.
