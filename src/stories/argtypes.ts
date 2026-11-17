/**
 * Shared argTypes `table` presets for component stories.
 *
 * EVERY prop a component accepts must be given a `table` so none show up
 * uncategorised in the Storybook auto-docs args table. Group each prop into one
 * of three categories so authors can tell at a glance what they can edit:
 *
 * - `CANVAS` — editable props declared under `props:` in the component's
 *   `<name>.component.yml`.
 * - `SLOT` — slot props declared under `slots:` in the `<name>.component.yml`
 *   (authors drop child components into these).
 * - `INTERNAL` — props accepted by the React component but NOT in the
 *   `<name>.component.yml` (e.g. `className`, `children`, or test/mock props).
 *
 * Attach the right preset to each argType's `table` field, e.g.
 * `table: tables.SLOT`. Never redeclare these inline — a prop moving between
 * categories should be a one-word edit and the labels must stay identical
 * across the library.
 */
export const tables = {
  CANVAS: { category: 'Canvas Props' },
  SLOT: { category: 'Canvas Slots' },
  INTERNAL: { category: 'Internal (JSX only)' },
} as const;
