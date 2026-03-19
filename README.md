# Document Management Frontend

A production-grade React SPA for managing invoices and receipts — built with **TypeScript**, **Material UI**, and a clean component architecture. Pairs with a [Django DDD backend](../document_storage/) to form a full-stack document management system.

## Tech Stack

| Layer     | Technology                                               |
| --------- | -------------------------------------------------------- |
| Framework | React 18 + TypeScript (strict mode)                      |
| Build     | Vite 5 (HMR, tree-shaking, env injection)                |
| UI        | Material UI 5, Emotion CSS-in-JS, custom theme           |
| HTTP      | Axios with centralized error interceptor                 |
| Testing   | Vitest + React Testing Library (90% coverage thresholds) |
| Quality   | ESLint (Airbnb), Prettier, Husky pre-commit hooks        |
| Commits   | Commitizen + Commitlint (Conventional Commits)           |
| Deploy    | Vercel                                                   |

## Features

- **Full CRUD** — Create, view, update, and delete documents with real-time list refresh
- **Line Item Management** — Add/remove line items with live progress bars and limit enforcement
- **Search & Filter** — Debounced search by reference (300ms), toggle filter by document type
- **Paginated List** — Server-side pagination with configurable page size (5 / 10 / 20)
- **Responsive Layout** — MUI table on desktop, card grid on mobile (`useMediaQuery` breakpoints)
- **Client-side Validation** — Mirrors backend domain rules (description max 30 chars, limit >= 1)
- **Force Delete Guard** — Confirmation dialog with explicit checkbox for documents that have line items
- **Snackbar Notifications** — Success/error feedback with auto-dismiss

## Project Structure

```
src/
├── api/                  # Axios client + typed API functions
│   ├── axiosClient.ts    # Base config, error interceptor
│   └── documentApi.ts    # CRUD endpoints (fully typed)
├── components/
│   ├── DocumentForm/     # Create, Update, LineItem dialogs
│   ├── DocumentList/     # List, ListItem, Filters (responsive)
│   ├── Layout/           # AppLayout (sticky header, footer)
│   └── common/           # ConfirmDialog, ErrorAlert, Pagination
├── hooks/
│   ├── useDocuments.ts   # Documents state, CRUD, filters, pagination
│   └── usePagination.ts  # Page/pageSize/totalCount state machine
├── pages/
│   └── DocumentsPage.tsx # Orchestrator — wires hooks to components
├── types/
│   └── document.ts       # Interfaces: Document, Payloads, Filters, Pagination
├── utils/
│   └── validation.ts     # Validation functions matching domain rules
├── __tests__/            # Co-located test suites (api, hooks, components, utils)
├── theme.ts              # Custom MUI theme (colors, typography, shape)
├── App.tsx               # Router setup
└── main.tsx              # Entry point
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     DocumentsPage                        │   │
│  │              (orchestrator — wires hooks to UI)          │   │
│  └───────┬─────────────────────────┬────────────────────────┘   │
│          │                         │                            │
│    ┌─────▼────────────┐    ┌────────▼──────────────────────┐    │
│    │  useDocuments    │    │        UI Components          │    │
│    │  ┌─────────────┐ │    │  ┌────────────┐ ┌──────────┐  │    │
│    │  │ documents[] │ │    │  │DocumentList│ │ Dialogs  │  │    │
│    │  │ loading     │ │◄──▶│  │  ListItem  │ │ Create   │  │    │
│    │  │ error       │ │    │  │  Filters   │ │ Update   │  │    │
│    │  │ filters     │ │    │  │            │ │ LineItem │  │    │
│    │  │ pagination  │ │    │  │            │ │ Delete   │  │    │
│    │  ├─────────────┤ │    │  └────────────┘ └──────────┘  │    │
│    │  │ CRUD ops    │ │    │  ┌────────────┐ ┌──────────┐  │    │
│    │  │ addLines()  │ │    │  │ Pagination │ │ErrorAlert│  │    │
│    │  │ removeLns() │ │    │  │ Component  │ │Snackbar  │  │    │
│    │  └─────────────┘ │    │  └────────────┘ └──────────┘  │    │
│    │  ┌─────────────┐ │    └───────────────────────────────┘    │
│    │  │usePagination│ │                                         │
│    │  └─────────────┘ │                                         │
│    └────────┬─────────┘                                         │
│             │                                                   │
│    ┌────────▼────────┐    ┌──────────────────────────────────┐  │
│    │  documentApi.ts │    │   validation.ts                  │  │
│    │  (typed Axios)  │    │   (mirrors backend domain rules) │  │
│    └────────┬────────┘    └──────────────────────────────────┘  │
│             │                                                   │
│    ┌────────▼────────┐                                          │
│    │  axiosClient.ts │                                          │
│    │  (interceptors) │                                          │
│    └────────┬────────┘                                          │
└─────────────┼───────────────────────────────────────────────────┘
              │ HTTP (VITE_API_BASE_URL)
              ▼
┌──────────────────────────┐
│   Django REST API        │
│   /api/documents/...     │
└──────────────────────────┘
```

### Data Flow

```
User action (click, type)
  │
  ▼
Component calls hook method (e.g. createDocument)
  │
  ▼
Hook calls documentApi function (typed request)
  │
  ▼
Axios sends HTTP request → Django backend
  │
  ▼
Response returns → hook updates state (documents[], loading, error)
  │
  ▼
React re-renders components with new state
  │
  ▼
Snackbar shows success/error notification
```

### Responsive Rendering Strategy

```
useMediaQuery('(min-width: 900px)')
  │
  ├── Desktop (≥ 900px)
  │   └── MUI Table with columns:
  │       Reference │ Description │ Type │ Items │ Limit │ Created │ Actions
  │
  └── Mobile (< 900px)
      └── MUI Card grid:
          ┌─────────────────────┐
          │ INV-001    invoice  │
          │ Invoice for order   │
          │ Items: 5 / 10      │
          │ [Edit] [Del] [+/-] │
          └─────────────────────┘
```

## Architecture Decisions

**No global state library** — `useDocuments` custom hook owns all document state (data, loading, error, filters, pagination) and exposes mutation methods that auto-refresh the list after writes. This avoids Redux/Context boilerplate for a single-resource app while keeping state logic testable in isolation.

**Dialogs over pages** — All create/update/line-item/delete flows live in dialogs. This keeps the user in context (the list is always visible behind the dialog) and avoids routing complexity for what are essentially modal operations.

**Validation parity** — Client-side validation in `utils/validation.ts` mirrors the backend domain rules exactly (e.g., description max 30 chars, document type must be `invoice` or `receipt`). This gives instant feedback while the server remains the source of truth.

**Typed API layer** — Every request and response is typed through `documentApi.ts`. The Axios error interceptor normalizes server errors into a consistent `Error` shape before they reach components.

## Assumptions & Decisions

The frontend requirements left room for interpretation. Here are the assumptions made:

- **Single-page app with dialogs**: The requirements show CRUD operations as separate sections, but a single page with modal dialogs provides a better UX — the user never loses context of the document list. React Router is included but currently only serves the single documents page (ready for future routes).
- **Server-side pagination**: The backend returns paginated responses. The frontend delegates all pagination, filtering, and search to the server rather than loading all documents and filtering client-side. This scales to large datasets.
- **Debounced search (300ms)**: Typing in the search field does not fire an API call on every keystroke. A 300ms debounce strikes a balance between responsiveness and avoiding excessive requests.
- **Page size options (5, 10, 20)**: These were chosen as sensible defaults. The backend accepts any `page_size` value, so the frontend could easily add more options.
- **Force delete UX**: When deleting a document with line items, a confirmation dialog appears with a checkbox the user must explicitly tick. This prevents accidental data loss and mirrors the backend's `force_delete` requirement.
- **No authentication**: The backend does not implement auth, so the frontend does not handle login/tokens. Adding auth would involve an Axios request interceptor for JWT/session tokens.
- **Vitest over Jest**: The starter repo uses Vite, so Vitest was chosen for native Vite integration, faster execution, and ESM compatibility. The API is Jest-compatible (`describe`, `it`, `expect`).

## Getting Started

### Prerequisites

- Node.js (see `.node-version`)
- pnpm

### Install & Run

```bash
pnpm install
pnpm dev              # http://localhost:5173
```

Create a `.env` file (or copy the existing one):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start Vite dev server with HMR               |
| `pnpm build`        | Type-check + production build                |
| `pnpm test`         | Run Vitest test suite                        |
| `pnpm test:watch`   | Vitest in watch mode                         |
| `pnpm lint`         | ESLint (zero warnings allowed)               |
| `pnpm lint:fix`     | Auto-fix lint issues                         |
| `pnpm format`       | Prettier format all source files             |
| `pnpm format:check` | Check formatting without writing             |
| `pnpm commit`       | Interactive conventional commit (Commitizen) |

### Quality Gates

Every commit passes through:

1. **Husky pre-commit** — triggers lint-staged
2. **lint-staged** — runs ESLint `--fix` + Prettier on staged `*.ts` / `*.tsx` files
3. **Commitlint** — enforces [Conventional Commits](https://www.conventionalcommits.org/) format
4. **Vitest** — 90% threshold on lines, branches, functions, and statements

## API Integration

The frontend consumes the Django REST API:

```
POST   /api/documents/                        Create document
GET    /api/documents/                        List (paginated, filterable, searchable)
GET    /api/documents/{reference}/             Get by reference
PUT    /api/documents/{reference}/             Update description + line item limit
DELETE /api/documents/{reference}/             Delete (force_delete required if has items)
PUT    /api/documents/{reference}/line-items/  Add line items
DELETE /api/documents/{reference}/line-items/  Remove line items
```

## Deployment

The frontend is deployed on **Vercel**. The production build (`pnpm build`) outputs to `dist/` and is served as a static SPA. The `VITE_API_BASE_URL` environment variable points to the deployed Django backend.
