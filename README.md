# Purple Cross — Employee Management

A simple employee management dashboard for Purple Cross Ltd, a pharmaceutical client. It replaces an Excel-based workflow for around 200 employees with a Vue 3 web app where the team can browse, add, edit and remove employee records.

The app is front-end only. It ships with sample data as JSON, and any changes you make are saved to your browser's `localStorage` so they stick around between refreshes.

## Stack

- **Vue 3** with `<script setup>` and TypeScript
- **Vite** for dev server and build
- **Vuetify 3** for Material Design components and theming
- **Pinia** for state, with localStorage hydration
- **vue-router** for navigation
- **ESLint + oxlint + Prettier** for code quality

## Getting started

Requires Node ≥ 20.19 (or ≥ 22.12).

```sh
npm install
npm run dev
```

The dev server prints the local URL (defaults to `http://localhost:5173`, falls back to the next free port).

### Other scripts

```sh
npm run build        # type-check + production build
npm run preview      # preview the production build locally
npm run type-check   # vue-tsc only
npm run lint         # oxlint then eslint
npm run format       # prettier
```

## Features

- **Employee directory** — sortable, searchable, paginated data table with `Currently employed` / `Employed soon` / `Terminated` / `To be terminated` status chips on the date columns; row count reflects active filters.
- **Filters** — free-text search (name / code / occupation), plus department, occupation, and status facets. Department and occupation options are derived from current data so they stay in sync.
- **View** — routed profile page (`/employees/:code`) with a clean two-column read-only card. Includes a not-found state for stale links.
- **Create / Edit** — single dialog component used for both flows, with validation:
  - Code: required, format `EMP\d{3,}`, must be unique on create.
  - Full Name: required, ≥ 2 chars, letters / spaces / `. ' -`.
  - Occupation, Department: required, combobox seeded from current values (free-typing allowed for new ones).
  - Termination Date (when set) must be on or after the employment date.
- **Delete** — confirmation dialog from both the list row and the profile toolbar; success snackbar; profile route returns to the list.
- **JSON Import / Export** — overflow menu in the list header. Export downloads `purple-cross-employees-YYYY-MM-DD.json`. Import validates each record, shows a summary like `Merge by code: 3 new, 4 updated, 1 skipped (invalid)`, and supports either Replace or Merge-by-code modes.
- **Persistence** — every CRUD mutation writes to `localStorage` under `pc.employees.v1`, so changes survive a page refresh. Pagination state persists across navigations during the session.
- **Responsive** — the toolbar collapses to stacked controls on narrow viewports, the data table flips into Vuetify's mobile layout below the `sm` breakpoint, and the FAB respects iOS safe areas.

## Project layout

```
src/
  components/
    ConfirmDialog.vue            generic confirm dialog (delete, import-replace)
    EmploymentStatusChip.vue     status chip used in table + profile
    EmployeeFormDialog.vue       create + edit form (single source of truth)
    ImportEmployeesDialog.vue    JSON import flow with merge / replace
  composables/
    useSnackbar.ts               singleton snackbar state + helpers
  data/
    employees.json               seed data (50 records)
  layouts/
    AppLayout.vue                app bar, breadcrumbs, snackbar host
  plugins/
    vuetify.ts                   theme + component defaults
  router/index.ts                routes + per-route document.title
  stores/
    employees.ts                 Pinia store, hydrates from localStorage
  types/
    employee.ts                  Employee + status string-literal types
  utils/
    employeeStatus.ts            employmentStatus / terminationStatus
    employeeImport.ts            parse, validate, merge, download
  views/
    EmployeeListView.vue         index page (table, filters, FAB)
    EmployeeProfileView.vue      routed profile
    NotFoundView.vue             404
```

## Design notes

- **Theme** — single muted purple accent (`#5E35B1`) on a near-white surface. Inputs use Vuetify's outlined variant for a corporate look; cards stay at low elevation. The wordmark in the app bar uses the `mdi-plus-thick` glyph as a stand-in for the brand cross.
- **Hybrid navigation** — View is a routed page so profiles are deep-linkable; Create and Edit are dialogs over the list so the user keeps filters and scroll position. The same dialog component handles both modes.
- **Localized validation** — form rules live next to the field they validate; cross-field rules (termination ≥ employment) recompute via the same draft state.

## Known limitations

- No backend — all data lives in `localStorage`. Clearing site data resets the directory to the seed JSON.
- No authentication — the avatar in the app bar is decorative.
- Status chips compare dates at start-of-day in the user's local timezone; supplied JSON dates are treated as ISO `YYYY-MM-DD`.
