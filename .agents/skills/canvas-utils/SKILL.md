---
name: canvas-utils
description:
  Runtime utilities and test helpers for Drupal Canvas code components. Use when
  a component needs to split/reconstruct slot children (getSlotChildren),
  upgrade from a server render to interactive behaviour (useHydrated), sync a
  tab/section to the URL hash (useHashNav, toSlug), detect the Canvas editor
  (isCanvasEditorMode, EditorNote), fetch the page's main entity
  (useMainEntity), or build Storybook slot/editor tests (createCanvasIsland,
  withEditorMode).
---

# @freelygive/canvas-utils

Utilities for React code components in Drupal Canvas. Each concern is a separate
entry point, so import only what you need:

| Import                                            | Provides                                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `@freelygive/canvas-utils/slots`                  | `getSlotChildren`, `isSlotEmpty`, `createSlotElement`, `StaticHtml`                      |
| `@freelygive/canvas-utils/ssr`                    | `useHydrated`                                                                            |
| `@freelygive/canvas-utils/navigation`             | `useHashNav`, `toSlug`, `getIndexFromHash`                                               |
| `@freelygive/canvas-utils/editor`                 | `isCanvasEditorMode`, `EditorNote`, `useEditorFullHeight`                                |
| `@freelygive/canvas-utils/entity`                 | `useMainEntity`                                                                          |
| `@freelygive/canvas-utils/types`                  | `CanvasImage`, `CanvasVideo`, `CanvasSlot`, `CanvasMenuItem` (types only)                |
| `@freelygive/canvas-utils/globals`                | Ambient side-effect: widens `Window.drupalSettings` + `React.CSSProperties` for CSS vars |
| `@freelygive/canvas-utils/vite-storybook`         | `componentNameResolver`, `componentCssPlugin`, `testsIndexer`                            |
| `@freelygive/canvas-utils/testing/canvas-slots`   | `createCanvasIsland`, `createCanvasSlot`, `rawProp`                                      |
| `@freelygive/canvas-utils/testing/editor-mode`    | `withEditorMode`, `enableEditorMode`, `disableEditorMode`                                |
| `@freelygive/canvas-utils/testing/jsonapi-client` | `JsonApiClientTestPatch` (type) — cast for stubbing `JsonApiClient.prototype`            |
| `canvas-utils-gen-types` (CLI)                    | Generate ambient `.d.ts` for `@/components/<name>` imports                               |

## Slots — split & reconstruct slot children

**Use case.** A slot normally renders as-is — just output `{content}` and let
Canvas place the children. Reach for `getSlotChildren` **only when the parent
needs to read data from its slot children or control how they render** — for
example a tabs block that reads each child's `title` to build the nav and shows
one panel at a time. (A plain container like a card grid does _not_ need it:
render `{content}` directly.)

`getSlotChildren(slot)` normalises the slot — whatever shape it arrives in
(React children in Storybook, `<canvas-island>` markup on the live site /
editor) — into a flat list of `{ type, props }` items; rebuild any child with
`<Child {...item.props} />`. The parser is dependency-free and runs identically
on the server and the browser, so a reconstructed child hydrates without
mismatch.

```jsx
'use client';

import { useState } from 'react';
import TabItem from '@/components/tab_item';
import { getSlotChildren } from '@freelygive/canvas-utils/slots';

// Needs each child's `title` for the nav, and renders only the active panel —
// both require reading/controlling the children, so `{content}` won't do.
const Tabs = ({ content }) => {
  const items = getSlotChildren(content);
  const [active, setActive] = useState(0);
  return (
    <div>
      <div role="tablist">
        {items.map((item, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
          >
            {item.props.title}
          </button>
        ))}
      </div>
      {/* Reconstruct just the active child. */}
      <TabItem {...items[active].props} />
    </div>
  );
};
```

- `getSlotChildren(slot)` →
  `Array<{ type?: string, props: Record<string, unknown> }>`. `type` is the
  child's `component.yml` `name` (or React display name). In `props`, each
  **Canvas prop** keeps its normal decoded value — its declared type, so a
  string, number, boolean, or an object like a media/image prop; a prop that is
  a **slot** is a renderable element instead — a `StaticHtml` element when the
  child came from `<canvas-island>` markup (live site / SSR), or the React node
  when composed directly (Storybook). Either way, render it as-is.
- `createSlotElement(name, html)` → a `StaticHtml` element wrapping raw HTML;
  useful for tests and for handing a slot back to a child.
- Keep child components "dumb" (they just render their props/slots); the parent
  owns any editor/live/interactive logic.

**`'use client';` goes on BOTH the parent and every slot-child component.** The
parent needs it because it calls hooks / drives interaction. Each child needs
its own `'use client';` too — and this is the key point: it is what makes Canvas
emit the child as a `<canvas-island props="…">` in the slot markup. Without it,
Canvas server-renders the child inline as plain HTML with no `props`, so
`getSlotChildren` has **nothing to extract** — you lose each child's `title`
(and every other prop the parent reads). Example: a `tabs` parent **and** its
`tab_item` child both start with `'use client';`.

## SSR — progressive enhancement with `useHydrated`

For a component that renders static markup on the server (or with no JS) and
upgrades to interactive behaviour once mounted. `useHydrated()` returns `false`
during SSR **and** on the first client render (so it matches the server — no
hydration mismatch), then `true` after mount. **A component using it must start
with `'use client';`** — otherwise Canvas leaves it as the static server render
and it never hydrates, so the flag stays `false` forever.

```jsx
'use client';

import { useHydrated } from '@freelygive/canvas-utils/ssr';
import { cn } from 'drupal-canvas';

const Disclosure = ({ summary, content }) => {
  const interactive = useHydrated();
  return (
    <div className={cn('disclosure', interactive && 'is-interactive')}>
      {/* Render the same DOM both sides; a class (toggled by `interactive`)
          drives the static-vs-interactive difference in CSS. */}
      <button type="button">{summary}</button>
      <div className="disclosure-body">{content}</div>
    </div>
  );
};
```

Branch on the returned flag (or a class derived from it) rather than swapping
the DOM structure, so the server and first client render stay identical.

## Navigation — hash-synced active item

`useHashNav` keeps an active index in sync with the URL hash: it defaults to the
first item, honours a matching `#slug` on load, and updates the hash with
`replaceState` (so selecting never scrolls). `toSlug` builds the fragment. **A
component using `useHashNav` must start with `'use client';`** so it hydrates
and its hash/click handling runs in the browser.

```jsx
'use client';

import { toSlug, useHashNav } from '@freelygive/canvas-utils/navigation';

const Sections = ({ items }) => {
  const [activeIndex, setActive] = useHashNav({
    items,
    getName: (item) => item.title,
  });
  return (
    <nav>
      {items.map((item, i) => {
        const slug = toSlug(item.title);
        return (
          <a
            key={slug}
            href={`#${slug}`}
            aria-current={i === activeIndex}
            onClick={(e) => {
              e.preventDefault();
              setActive(i);
            }}
          >
            {item.title}
          </a>
        );
      })}
    </nav>
  );
};
```

- `useHashNav({ items, getName })` → `[activeIndex, setActiveIndex]`.
- `toSlug(name)` → a URL-safe lowercase slug (`'Our Services'` →
  `'our-services'`).
- `getIndexFromHash(items, getName)` → the index matching the current hash, or
  `-1`.

## Editor — editor-aware UI

`isCanvasEditorMode()` is `true` only inside the Canvas page editor — the signal
is `window.drupalSettings.canvas` being set, which the editor emits and no other
Canvas surface does. It is always `false` under SSR (it needs the browser) and
on Canvas's anonymous `/canvas/preview/...` route, so an editor-aware component
must be `'use client'`. Use it to show authoring affordances that don't belong
on the live site. `EditorNote` renders a dashed note box for that purpose.

```jsx
'use client';

import {
  EditorNote,
  isCanvasEditorMode,
} from '@freelygive/canvas-utils/editor';

const Tab = ({ title, content }) => {
  const editor = isCanvasEditorMode();
  return (
    <div>
      {editor && (
        <EditorNote>
          Tab: <em>{title}</em>
        </EditorNote>
      )}
      {content}
    </div>
  );
};
```

- `isCanvasEditorMode()` → `boolean`. `true` iff `window.drupalSettings.canvas`
  is set; `false` everywhere else (including preview).
- `<EditorNote>{children}</EditorNote>` → a dashed callout for editor-only
  hints. Styles are inline (no Tailwind scan or CSS import needed) — theme via
  the CSS custom properties `--canvas-editor-note-bg`,
  `--canvas-editor-note-border`, and `--canvas-editor-note-color` on any
  ancestor. A caller-supplied `className` still applies alongside the inline
  styles.
- `useEditorFullHeight(enabled)` → `{ minHeight }` style (or `undefined`) that
  sizes a component to the editor viewport when `enabled`.

## Entity — the page's main entity

`useMainEntity` fetches (via SWR) the content entity backing the current page —
using Canvas's `mainEntity` when present, else a title lookup. It runs on the
client (data fetching), so read from the returned SWR result (`data`,
`isLoading`, …).

```jsx
import { useMainEntity } from '@freelygive/canvas-utils/entity';

const NewsBody = () => {
  const { data, isLoading } = useMainEntity('node--news_article', {
    includes: ['field_image'],
    fields: { 'node--news_article': ['title', 'body'] },
  });
  if (isLoading) return null;
  return <article>{data?.body?.value}</article>;
};
```

`useMainEntity(entityType, { includes?, fields? })` → an SWR result
(`{ data, error, isLoading, ... }`); `data` is the entity or `null`.

## Types — shared TypeScript shapes

`@freelygive/canvas-utils/types` declares the field shapes Canvas hands
components for the built-in JSON-schema types, so components don't each
redeclare identical local aliases. All exports are `type`/`interface` only —
zero runtime cost.

```ts
import type {
  CanvasImage,
  CanvasSlot,
  CanvasVideo,
} from '@freelygive/canvas-utils/types';

type HeroProps = {
  title: string;
  image?: CanvasImage;
  video?: CanvasVideo;
  content?: CanvasSlot;
};
```

- `CanvasImage` — `{ src; alt?; width?; height? }` (Canvas `image` field).
- `CanvasVideo` — `{ src; poster? }` (Canvas `video` field).
- `CanvasSlot` — `ReactNode` alias for slot props. Slots come in as React
  children in most contexts and as an HTML string in SSR / editor paths, both of
  which satisfy `ReactNode`. Use `getSlotChildren` when you need to parse the
  string form.
- `CanvasMenuItem` — tree shape produced by `sortMenu` (from `drupal-canvas`) on
  top of `jsonapi_menu_items`:
  `{ id, title?, url?, parent?, weight?, _children?, _hasSubmenu? }`. Only `id`
  is guaranteed; branch on `title` for the linkset variant.

## Ambient globals — `@freelygive/canvas-utils/globals`

Types-only side-effect import that widens two ambient shapes every Canvas
project ends up needing:

- `Window.drupalSettings` — carries Canvas's `canvasData.v0` payload and the
  `canvas` editor sentinel, so `window.drupalSettings?.canvasData?.v0.pageTitle`
  type-checks without an `unknown` cast.
- `React.CSSProperties` — accepts CSS custom properties inline
  (`style={{ '--foo': 'red' }}`) with no `as` cast.

Import once at a top-level entry or wire via tsconfig `types` — no runtime cost,
no per-file import needed:

```ts
import '@freelygive/canvas-utils/globals';
```

```jsonc
// tsconfig.json
{ "compilerOptions": { "types": ["@freelygive/canvas-utils/globals"] } }
```

## Vite + Storybook plugins

`@freelygive/canvas-utils/vite-storybook` groups three build-time helpers for
Canvas projects that follow the CLI's named-metadata layout
(`<folder>/<name>.component.yml` + `<name>.<ext>`). Wire them into
`.storybook/main.ts` (and `vite.config.js` for the resolver). They stay portable
and dependency-light (Node `fs` / `path` and the `Plugin` / `Indexer` types
only).

```ts
// .storybook/main.ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  componentCssPlugin,
  componentNameResolver,
  testsIndexer,
} from '@freelygive/canvas-utils/vite-storybook';
import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { StorybookConfig } from '@storybook/react-vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  async viteFinal(config) {
    // MUST come before vite-tsconfig-paths — see next bullet.
    config.plugins = config.plugins || [];
    config.plugins.unshift(componentNameResolver());
    config.plugins.push(tsconfigPaths({ root: path.resolve(__dirname, '..') }));
    return mergeConfig(config, {
      plugins: [componentCssPlugin()],
    });
  },
  experimental_indexers: testsIndexer,
} satisfies StorybookConfig;
```

- **`componentNameResolver(componentsDir?)` — must register before
  `vite-tsconfig-paths`.** Both use `enforce: 'pre'`, so registration order
  decides who resolves `@/components/<name>` first: `tsconfig-paths` maps it to
  the component _directory_ (no `index.*` → 404), whereas the resolver maps it
  to the Canvas-convention `<name>.<ext>` entry file. Storybook's own
  `tsconfig-paths` integration also rewrites the alias before user pre-plugins
  run, so the resolver matches BOTH forms (bare alias AND the absolute rewrite)
  — but consumer registration order still needs to put it first for
  non-Storybook Vite builds.
- `componentCssPlugin(componentsDir?)` — auto-imports a component's sibling
  `<name>.css` so Storybook picks it up (Canvas already does this on the live
  site). Skips `.stories.*` / `.tests.*` files.
- `testsIndexer(existingIndexers)` — registers the built-in CSF indexer for
  `.tests.*` files, so colocated `<machineName>.tests.tsx` play-function tests
  picked up by a stories glob aren't rejected at indexing time. Pass as
  `experimental_indexers` directly.

### Types generation — `canvas-utils-gen-types`

`@/components/<name>` isn't a real file path — the resolver above maps it at
build time, but TypeScript still needs `declare module '@/components/<name>'`
ambient blocks to type-check the imports. Two options:

1. **Hand-author the blocks** in a project-local `.d.ts` (usually
   `src/types/modules.d.ts`). Fine for a small project, but every new component
   needs a new block and any `export type` union you added later drifts unless
   you remember to update it here too.
2. **Generate them** with the CLI:

   ```bash
   npx canvas-utils-gen-types --out src/types/canvas-components.d.ts
   ```

   The generator parses each component's entry file with the TypeScript compiler
   API and emits one `declare module '@/components/<name>' { … }` block per
   component with an explicit named re-export for every top-level export (values
   as `export { … } from`, types as `export type { … } from`, plus
   `export { default }`). Named enumeration is required because
   `export * from '…'` inside an ambient block does not propagate named
   type/value exports under `moduleResolution: bundler` — so the alias would
   silently miss every variant union or prop type. Listing them individually
   mirrors the entry's public surface exactly, with no per-component upkeep.
   Wire it as a `prebuild` script (or run it whenever a `.component.yml`
   changes) and commit the generated file so editors and CI both see the same
   types.

   If you're already using `componentNameResolver`, pass `emitTypes: true` (or
   `emitTypes: { out: '…' }`) to the plugin instead — it writes the same file at
   plugin load and again on component-file changes, so no extra `prebuild` step
   is needed:

   ```ts
   config.plugins.unshift(componentNameResolver({ emitTypes: true }));
   ```

   The CLI resolves `componentsDir` with the same precedence as the plugins
   (canvas.config.json → `CANVAS_COMPONENT_DIR` → `src/components`); override
   with `--components <path>`.

### Resolution order for `componentsDir`

`componentNameResolver` and `componentCssPlugin` both accept `componentsDir` as
an optional argument. When omitted, they resolve it the same way Canvas CLI
does:

1. Explicit argument (if truthy).
2. `componentDir` field in `canvas.config.json` at `process.cwd()`.
3. `CANVAS_COMPONENT_DIR` env var — **legacy**, emits a one-time deprecation
   warning. Prefer `canvas.config.json`.
4. Default `"src/components"` relative to `process.cwd()`.

## Testing helpers (Storybook / Vitest)

Build the exact slot shapes Canvas hands a component at runtime, and simulate
editor mode, so a story exercises the real parsing/editor paths.

```tsx
import {
  createCanvasIsland,
  createCanvasSlot,
} from '@freelygive/canvas-utils/testing/canvas-slots';
import { withEditorMode } from '@freelygive/canvas-utils/testing/editor-mode';

// A `content` slot exactly as Canvas delivers it — child islands with props and
// nested slot templates that `getSlotChildren` parses.
const slot = createCanvasSlot(
  createCanvasIsland({
    props: { title: 'One' },
    name: 'Card',
    slots: { content: '<p>First</p>' },
  }) +
    createCanvasIsland({
      props: { title: 'Two' },
      name: 'Card',
      slots: { content: '<p>Second</p>' },
    }),
);

export const Live = { args: { content: slot } };

// Render a story as if inside the Canvas editor (isCanvasEditorMode() → true).
export const Editor = { decorators: [withEditorMode], args: { content: slot } };
```

- `createCanvasIsland({ props?, name?, slots? })` → the HTML string for one
  child island (`props` are wrapped as `["raw", value]` tuples automatically).
- `createCanvasSlot(html, name?)` → a `StaticHtml` slot element wrapping that
  HTML.
- `withEditorMode` (decorator) / `enableEditorMode()` / `disableEditorMode()` →
  toggle editor mode for a story or test.
- `JsonApiClientTestPatch` (from
  `@freelygive/canvas-utils/testing/jsonapi-client`) — type-only cast target for
  monkey-patching `JsonApiClient.prototype` when a story needs to stub JSON:API
  responses (`getResource` / `getCollection`) without a live Drupal backend. Use
  `as unknown as JsonApiClientTestPatch` instead of `any`.
