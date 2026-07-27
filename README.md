# Cansche: A High-Throughput Component-Based Calendar Editor

A high-productivity time management system designed for batch processing, component-based event templating, and multi-layer calendar composition. Cansche models time allocation using paradigms inspired by visual design systems (Figma Components) and spreadsheet calculation engines.

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. System Architecture and Core Concepts](#2-system-architecture-and-core-concepts)
  - [2.1 Component-Based Presets and Inheritance](#21-component-based-presets-and-inheritance)
  - [2.2 Instance-Level Overrides and Checklist State](#22-instance-level-overrides-and-checklist-state)
  - [2.3 Multi-Calendar Layer Composition](#23-multi-calendar-layer-composition)
  - [2.4 Command Pattern and Undo/Redo Engine](#24-command-pattern-and-undoredo-engine)
- [3. Repository Structure](#3-repository-structure)
- [4. Prerequisites and Environment](#4-prerequisites-and-environment)
- [5. Installation](#5-installation)
- [6. Running the Application](#6-running-the-application)
- [7. Testing and Verification](#7-testing-and-verification)
- [8. Data Exchange Format Specification (`.cansche.json`)](#8-data-exchange-format-specification-canschejson)
- [9. Development Guidelines](#9-development-guidelines)
- [10. License](#10-license)

---

## 1. Overview

Traditional digital calendar software relies on individual event creation forms, making bulk scheduling across multi-week or multi-month intervals inefficient. Cansche addresses this limitation by introducing batch selection algorithms, reusable master component templates (Presets), and layer-based composition.

Key functional capabilities include:
- **Batch Range Selection**: Select single dates, arbitrary date spans, or programmatic patterns (e.g., all Saturdays, all weekends).
- **Master Templates (Presets)**: Define reusable schedule templates containing time allocations, locations, categories, and default checklist procedures.
- **Dynamic Propagation**: Updating a master Preset component automatically propagates updates to all referenced calendar instances in real time.
- **Layered Composition**: Overlap multiple calendar layers (e.g., Academic, Work, Personal) onto a single high-density monthly view without merging underlying data models.
- **Local Persistence & Portability**: Zero vendor lock-in with offline-first IndexedDB storage and standardized `.cansche.json` file serialization.

---

## 2. System Architecture and Core Concepts

### 2.1 Component-Based Presets and Inheritance

In Cansche, a **Preset** represents a reusable configuration schema rather than a static visual tag. Presets encapsulate default properties:

```typescript
export interface Preset {
  id: string;
  name: string;
  emoji: string;
  color: string;
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

Calendar cells do not duplicate preset data; instead, they store lightweight instances referencing the parent `presetId`.

### 2.2 Instance-Level Overrides and Checklist State

When a Preset is applied to one or more dates, a `PresetInstance` is initialized:

- **Inheritance**: Unmodified fields fall back dynamically to the parent `Preset` definition.
- **Overrides**: Specific date instances can override properties (e.g., location or custom start time) without breaking the reference link or losing template updates on unmodified fields.
- **Isolated Checklist State**: Each instance maintains a date-specific completion state (`checklistState: ChecklistItem[]`). Checking off a task on day $X$ alters only that day's instance.

```typescript
export interface PresetInstance {
  id: string;
  presetId: string;
  source: 'preset' | 'manual' | 'google';
  overrides?: PresetInstanceOverrides;
  checklistState: ChecklistItem[];
  createdAt: string;
  modifiedAt?: string;
}
```

### 2.3 Multi-Calendar Layer Composition

The system structures user data inside a top-level `Workspace` container holding a collection of `Calendar` layers.

- `activeCalendarIds: string[]`: Defines the active set of calendar layers rendered simultaneously on the calendar grid.
- `editingCalendarId: string`: Designates the target calendar layer currently selected to receive new preset applications and modifications.

This separation enables composable viewing (e.g., viewing Work and Academic layers together) while keeping modifications cleanly targeted to a single layer.

### 2.4 Command Pattern and Undo/Redo Engine

All state mutations in Cansche execute via encapsulate commands implementing the `Command` interface:

```typescript
export interface Command {
  description: string;
  execute(context: EngineContext): void;
  undo(context: EngineContext): void;
}
```

Command operations (such as `ApplyPresetCommand`, `ClearCellsCommand`, `MoveCommand`, and `PasteCommand`) support deterministic undo/redo history stacks and multi-date clipboard buffers with relative day offsets.

---

## 3. Repository Structure

Cansche is implemented as a monorepo managed via `pnpm` workspaces.

```
.
├── apps/
│   └── web/                   # Vue 3 + Vite + Tailwind CSS Single Page Application
├── packages/
│   ├── api/                   # High-level reactive API facade (CalendarAPI)
│   ├── domain/                # Pure TypeScript domain interfaces and type definitions
│   ├── engine/                # Core execution engine, Command pattern, History, and I/O
│   ├── selection/             # Selection service and batch filtering algorithms
│   ├── shared/                # Pure ISO-date utility functions and ID generators
│   └── storage/               # Offline-first IndexedDB storage adapter (Dexie)
├── DESIGN.md                  # Comprehensive design system reference manual
├── package.json               # Root workspace configuration
└── pnpm-workspace.yaml        # Workspace package boundaries
```

---

## 4. Prerequisites and Environment

Ensure your local development environment meets the following requirements:

- **Node.js**: Version 20.0.0 LTS or higher (Node.js 22 LTS recommended).
- **Package Manager**: `pnpm` version 9.0.0 or higher.
- **Browser**: Modern Chromium-based browser, Firefox, or Safari supporting ES2022 and IndexedDB.

---

## 5. Installation

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/user/cansche.git
cd cansche
pnpm install
```

---

## 6. Running the Application

### Development Mode

To start the Vite development server with hot-module replacement (HMR):

```bash
pnpm dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build

To type-check and compile all packages for production deployment:

```bash
pnpm build
```

To preview the built production bundle locally:

```bash
pnpm preview
```

---

## 7. Testing and Verification

Unit and integration tests are powered by Vitest across all monorepo packages.

To run the full automated test suite:

```bash
pnpm test
```

To execute tests in watch mode during development:

```bash
pnpm test:watch
```

---

## 8. Data Exchange Format Specification (`.cansche.json`)

Cansche specifies a standardized JSON schema for calendar and workspace serialization. Files use the `.cansche.json` extension (MIME type `application/vnd.cansche+json`).

### 8.1 Schema Definition

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

### 8.2 Sample Calendar File

```json
{
  "format": "cansche",
  "version": 1,
  "type": "calendar",
  "metadata": {
    "createdAt": "2026-07-27T15:20:00.000Z",
    "updatedAt": "2026-07-27T15:20:00.000Z",
    "appVersion": "1.0.0"
  },
  "data": {
    "id": "cal_182749",
    "name": "Academic 2026",
    "description": "University lectures and study tasks",
    "color": "#5e6ad2",
    "order": 0,
    "visible": true,
    "presets": {
      "preset_lecture": {
        "id": "preset_lecture",
        "name": "University Lecture",
        "emoji": "📚",
        "color": "#5e6ad2",
        "schedule": {
          "startTime": "19:00",
          "endTime": "22:30"
        },
        "metadata": {
          "category": "Education"
        },
        "content": {
          "location": "Central Campus",
          "checklistTemplate": ["Review lecture slides", "Complete exercises"]
        }
      }
    },
    "cells": {
      "2026-08-10": {
        "date": "2026-08-10",
        "presetInstances": [
          {
            "id": "inst_901823",
            "presetId": "preset_lecture",
            "source": "preset",
            "checklistState": [
              {
                "id": "chk_102",
                "text": "Review lecture slides",
                "completed": true
              },
              {
                "id": "chk_103",
                "text": "Complete exercises",
                "completed": false
              }
            ],
            "createdAt": "2026-07-27T15:20:00.000Z"
          }
        ]
      }
    }
  }
}
```

---

## 9. Development Guidelines

### 9.1 Code Style and Conventions

- **Type Safety**: Avoid using `any`. Define domain interfaces strictly within `packages/domain`.
- **Immutability and Encapsulation**: Mutate engine state strictly through `Command` instances passed to `CalendarAPI.execute()`.
- **Design Alignment**: UI components must strictly adhere to the precision tokens and rules defined in [`DESIGN.md`](./DESIGN.md) (Linear Dark theme, hair-line borders, 12px/6px/4px border radius ladder).

### 9.2 Package Boundaries

Do not create circular dependencies between workspace packages. Dependency flow must remain unidirectional:

```
apps/web -> packages/api -> packages/engine -> packages/selection -> packages/domain -> packages/shared
```

---

## 10. License

This project is licensed under the Apache License 2.0. See the `LICENSE` file for details.
