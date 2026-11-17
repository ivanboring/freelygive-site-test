---
name: stories
description: Creating and modifying Storybook stories for components and pages
---

# Creating and modifying stories

Stories fall into a few categories:

## Component stories

- Location: colocated in the component's folder,
  `src/components/<component_name>/`
- Naming convention: `<component_name>.stories.tsx` (`snake_case`, the same base
  name as the component)

These are intended to provide examples of how to use a component.

Auto documentation should be used, and all parameter types must be explicitly
defined with appropriate controls. Always cross-reference the story parameters
with the `<component_name>.component.yml` `props` and `slots`.

Non-interactive tests (e.g. expects) can be added to component stories, but
interactive tests that simulate user input MUST NOT be included in stories.

### Component-level prose description

Every component story's `meta` MUST include a
`parameters.docs.description.component` string. It renders at the top of the
autodocs page and is the first thing an author reads about the component.

- 1&ndash;3 sentences, plain prose.
- Cover what the component does, how it is used, and how it composes with
  siblings if that is part of its shape (e.g. a `card_container` wraps `heading`
  and `grid_container`).
- If the component fetches data (JSON:API, main entity, `getSiteData()`, etc.),
  note the data source.
- Do NOT describe the Canvas-vs-internal prop distinction in the prose &mdash;
  the argTypes table already conveys that via `table.category` groupings (see
  "Group argTypes by Canvas vs Internal" below).

```ts
const meta = {
  title: 'Components/Stats',
  component: Stats,
  parameters: {
    docs: {
      description: {
        component:
          'Block of metrics with an optional heading. Items are supplied via the `items` slot using `stat_item` children.',
      },
    },
  },
  argTypes: {
    /* ... */
  },
} satisfies Meta<typeof Stats>;
```

### Group every argType by Canvas Props, Canvas Slots, or Internal

**Every prop the React component accepts MUST appear in `argTypes` with a
`table.category`** — otherwise it renders uncategorised in the auto-docs args
table. Group each into one of three buckets:

- **`Canvas Props`** (`tables.CANVAS`) — props declared under `props:` in
  `<component_name>.component.yml`, editable by content authors in Canvas.
- **`Canvas Slots`** (`tables.SLOT`) — slot props declared under `slots:` in
  `<component_name>.component.yml`; authors drop child components into these.
- **`Internal (JSX only)`** (`tables.INTERNAL`) — props the component accepts
  but that are NOT in `<component_name>.component.yml`: `className`, `children`,
  JSX-composition helpers (e.g. a `rightColumn` node), and test/mock props.

Import the shared `tables` presets from `@/stories/argtypes` and attach the
right one to each argType — never re-declare the presets inline. Declare the
argTypes grouped in that order (Canvas Props, then Canvas Slots, then Internal),
which is also how the categories sort in the args table.

```ts
import { tables } from '@/stories/argtypes';

const meta = {
  title: 'Components/Foo',
  component: Foo,
  argTypes: {
    // Canvas Props — mirror component.yml `props:`
    variant: {
      control: 'select',
      options: ['Solid', 'Outline'],
      description: 'Visual style variant.',
      table: tables.CANVAS,
    },
    text: { control: 'text', description: 'Label text.', table: tables.CANVAS },

    // Canvas Slots — mirror component.yml `slots:`
    content: {
      control: false,
      description: 'Slot for the components rendered inside Foo.',
      table: tables.SLOT,
    },

    // Internal — accepted by the component, not surfaced to Canvas editors
    className: {
      control: 'text',
      description: 'Extra CSS classes appended to the outer element.',
      table: tables.INTERNAL,
    },
    children: {
      control: false,
      description: 'React nodes rendered inside the component.',
      table: tables.INTERNAL,
    },
  },
} satisfies Meta<typeof Foo>;
```

Guidance on `control`:

- Enums (matching a `<component_name>.component.yml` `enum`):
  `control: 'select'` with an `options: […]` mirroring the enum values exactly.
- Strings / URIs: `control: 'text'`.
- Booleans: `control: 'boolean'`.
- Numbers with a bounded range: `control: { type: 'number', min, max }` or
  `control: { type: 'range', min, max, step }`.
- Slot props and React nodes (`children`): `control: false`.
- Media objects (image / video / etc.): `control: 'object'`.

Autodocs generates a "Hide … items" toggle per category. Storybook does not
currently expose a "collapsed by default" API for categories; consider that a
known limitation.

Both props and slots arguments MUST be either scalar values, a media object
type, or a React fragment of public components. You MUST NOT use direct markup
or custom styling — all visual presentation must be encapsulated within the
components themselves. Stories MUST only use props and slots defined in the
component's `<component_name>.component.yml`, unless the prop exists to
facilitate testing or mocking (e.g. injecting test data).

## Test stories

- Location: colocated in the component's folder,
  `src/components/<component_name>/`
- Naming convention: `<component_name>.tests.tsx` (`snake_case`), although if a
  component has a large number of tests, they can be grouped using
  `<component_name>-<group>.tests.tsx`. The `.tests.tsx` suffix (not
  `.stories.tsx`) keeps these test-only stories out of the component-story glob;
  they are indexed via `testsIndexer` in `.storybook/main.ts`.

These are intended to provide automated tests for components and other UI
elements.

Auto documentation MUST be disabled.

If a component makes use of the canvas parsing to directly inspect or manipulate
components in props, a test should be added to ensure that the component
correctly parses the canvas island.

### Responsive (desktop and mobile) testing

Any component whose layout or controls change by breakpoint MUST be tested at
both a desktop and a mobile viewport — never only one. Either re-run the
assertions at each width inside a single play function, or provide separate
desktop and mobile test stories.

Set the viewport from within the play function:

```ts
const setViewport = async (width: number, height: number) => {
  const { page } = await import('vitest/browser');
  await page.viewport(width, height);
  await new Promise((r) => setTimeout(r, 100)); // let the layout settle
};
```

Assert the breakpoint-specific differences explicitly, including that the
control for the _other_ breakpoint is hidden — e.g. a desktop sidebar nav is
visible and the mobile dropdown is not, and vice versa.
Hidden-when-it-should-show (and the reverse) is a common regression that only
surfaces when both widths are tested.

### Testing server-rendered / no-JS behaviour

A component that renders differently before hydration (server / no-JavaScript)
than once interactive — i.e. progressive enhancement — MUST have its
pre-hydration render tested, not just its hydrated one, because that is what
search engines and no-JS visitors receive. Storybook always runs JavaScript, so
reproduce the no-JS render by preventing the component from upgrading to its
interactive state.

When the upgrade is gated on a one-shot `requestAnimationFrame` (a common
`useHydrated`-style flag), stub it in the story's `beforeEach` so the callback
never fires, and restore it in the returned teardown:

```ts
beforeEach: () => {
  const original = window.requestAnimationFrame;
  window.requestAnimationFrame = () => 0; // returns a handle, never calls back
  return () => {
    window.requestAnimationFrame = original;
  };
},
```

The component then stays in its static/stacked render. Assert the no-JS
contract: it never gains its interactive marker (e.g. an `is-interactive`
class), all content is reachable (every panel present and visible, not just the
active one), and any navigation degrades to working native anchors (each link's
`href` targets a real element `id`). Test this at both desktop and mobile
viewports. A matching no-play story is also useful for visually inspecting the
pre-hydration render.

## Example pages

- Location: `src/pages`
- Naming convention: `<page-name>.stories.tsx` using `kebab-case`.

These provide an example of how a page could be built using components.

Autodocs must be disabled and the fullscreen layout must be used. There must
only be one story per page.

The PageLayout component from the layouts story should be used to ensure
consistent wrapping of the page.

Both props and slots arguments MUST be either scalar values, a media object
type, or a React fragment of public components. You MUST NOT use direct markup
or custom styling — all visual presentation must be encapsulated within the
components themselves. Stories MUST only use props and slots defined in the
component's `<component_name>.component.yml`, unless the prop exists to
facilitate testing or mocking. Pages should be directly composed of components
so that the "show code" view reflects real component usage.

## Assets

### Placeholder images

Placeholder.io can be used to generate placeholder images for components:

```
{
   src: "https://placehold.co/800x600",
   alt: "Example image placeholder",
   width: 800,
   height: 600,
}
```

### Real assets

Assets should be stored in the `src/stories/assets` directory, in suitable
subdirectories depending on the scope of the asset. An `index.ts` file must be
created to export the assets with the correct image type. Real assets must never
be directly imported in stories without their image type. The image type must
include the correct dimensions and provide alt text.
