---
name: component-authoring
description:
  Requirements and patterns for creating or modifying React components with
  Tailwind CSS and CVA
---

# Requirements for creating or modifying components

## Technology stack

- React 19;
- Tailwind CSS 4.1+;
- class-variance-authority (CVA) for component variants;
- `clsx` and `tailwind-merge` via the `cn()` utility;
- `FormattedText` component from `@/lib/FormattedText` for rendering HTML
  content.

## Component patterns

- Use CVA (`cva()`) to define variant styles for components.
- Use the `cn()` utility from `@/lib/utils` to merge class names.
- Always export components as default exports.
- Accept a `className` prop for style customization when necessary.
- Use the `@/components` import alias when importing other components.
- Only use dependencies listed in the technology stack; do not add third-party
  imports or create new library utilities.
- Place each component in its own folder under `src/components/`. The folder
  MUST contain a `<component_name>.tsx` entry file and a
  `<component_name>.component.yml` metadata file (both named after the
  component, NOT `index.*` and NOT bare `component.yml`). Do not create nested
  folder structures. See the `create-component` skill for details.
- Author components in TypeScript (`.tsx`). Use `interface FooProps { ... }` for
  the prop shape, annotate the destructure (`({ ... }: FooProps)`), and use
  short `/** ... */` comments above each prop instead of JSDoc `@param` tags.

## Shared prop types

Prop types come from three places, in this order of preference:

1. **`@freelygive/canvas-utils/types`** — the shape of Canvas-provided fields
   (image, video, slot).
2. **Your project's shared lib** — cross-cutting unions (theme polarity, text
   shadow) and utilities (menu-item shape, icon renderer) that don't belong to
   any single component.
3. **`@/components/<name>`** — unions owned by the lowest-level component that
   defines them; every other component that accepts the same values imports them
   from there.
4. **Local `type` alias** — declared inside the component when the concept is
   per-component (see "Import when you forward a value; duplicate when you remap
   it" below).

### `@freelygive/canvas-utils/types` — Canvas field shapes

Reuse these instead of redeclaring the same shape locally:

- **`CanvasImage`** — shape of any image field
  (`{ src, alt?, width?, height? }`). Use for every image / background-image /
  logo prop, not a per-component `FooImageData` alias.
- **`CanvasVideo`** — `{ src, poster? }`. Use for HTML5 video source props.
- **`CanvasSlot`** — semantic alias for a Canvas slot prop. Slots arrive as a
  React tree in client contexts and an HTML string on the server / in the
  editor; both satisfy `ReactNode`, but typing slot-declared props (props listed
  under `slots:` in `<name>.component.yml`) as `CanvasSlot` makes the intent
  explicit. Keep `ReactNode` for JSX-only children (e.g. a `Button`'s
  `children`, wrapper `children` on internal sub-components).

### Cross-cutting unions in your project's shared lib

For unions that aren't owned by any single component — theme polarity, text
shadow, menu-item shape — declare them once in a shared lib (e.g. `src/lib/`)
and import from there. Typical entries:

- `TextColor` — `'Dark' | 'Light'`. The default theme polarity used by most
  components.
- `TextShadow` — `'Light' | 'Medium' | 'Heavy'`.
- `MenuItem` — shape of an entry returned by Drupal Canvas's `sortMenu(...)`
  (`{ id, title, url?, _children? }`).
- `Icon` — an IcoMoon-style glyph renderer that takes a symbolic `name` prop, so
  components don't redeclare the code-point table.

The shared theme lib is reserved for unions that don't belong to any single
component. Extensions that add values (e.g. a heading gains `'Blue'`) live on
the extending component, not in the shared lib:

```tsx
// src/components/heading/heading.tsx
import type { TextColor } from '@/lib/theme';

export type HeadingColor = TextColor | 'Blue';
```

### `@/components/<name>` — source-owned unions

The lowest-level component owns each union it introduces and exports it by name.
Consumers always import from `@/components/<name>` — never by relative path, and
never by redeclaring the values inline.

```tsx
// ✅ GOOD: import the source-owned union
import type { HeadingSize } from '@/components/heading';

interface HeroProps {
  headingSize?: HeadingSize;
}

// ❌ BAD: redeclaring the same values in a consumer
interface HeroProps {
  headingSize?: 'Small' | 'Medium' | 'Large' | 'Extra Large';
}
```

**Adding a new source-owned union:** `export type` it from the source component.
If your project uses a TypeScript module identity file to expose
`@/components/<name>` as a pass-through re-export, add the type to that file so
`@/components/<name>` resolves to the same symbol. Otherwise consumers import
from the component's file directly.

### Import when you forward a value; duplicate when you remap it

When two components share the same enum values, the deciding test is **what the
consumer does with the value**:

- **Forwarding (pass it on unchanged)** — the consumer passes the prop straight
  through to the component that owns the union (e.g. a `Card` forwards
  `headingSize`/`headingElement` into the `<Heading>` it renders, and a
  `CardContainer` forwards `layout` into its `<GridContainer>`). A rename or
  added value on the owner IS a bug for the consumer, so **import the
  source-owned union**. If the consumer only exposes a curated subset of the
  owner's values, narrow with `Extract<>` (see "TypeScript unions may be wider
  than YAML enums" below) rather than redeclaring the literals.

  ```tsx
  import type { GridLayout } from '@/components/grid_container';
  import type { HeadingElement, HeadingSize } from '@/components/heading';
  ```

- **Remapping (translate to your own values or semantics)** — the value never
  reaches the owner unchanged; the consumer maps it to something else or uses it
  to drive its own markup independently. Then the union belongs to the consumer:
  declare a **local `type`** and do NOT centralize it. Alignment is the
  canonical example — a `Heading`'s `HeadingLayout` and a `Card`'s `CardLayout`
  each apply alignment to their own markup, and a `TwoColumnText`'s
  `TwoColumnLayout` is `'Left aligned' | 'Centered'` (different values
  entirely), so a rename on one is not a bug on the others.

(A union owned by _no single component_ — cross-cutting theme values like
`TextColor`/`TextShadow` — is a third case: it lives in the shared lib, not on a
component. See "Shared prop types" above.)

**Rule of thumb:** if a rename or value change in the owner would be a bug for
the consumer, share the type — import it (with `Extract<>` for a subset). If the
consumer maps or independently chooses the values, duplicate.

## Server-side rendering and `'use client'`

Drupal Canvas can server-render components (SSR). SSR is **not** the default —
it is enabled per site. When SSR is enabled, each component is treated as
follows:

- **A component that _can_ be server-rendered is server-rendered, and is not
  hydrated on the client** — it becomes static HTML with no client-side
  JavaScript behaviour.
- **A component that _cannot_ be server-rendered** — for example one that
  fetches data at runtime (SWR / `fetch`) or otherwise depends on the browser —
  **is not server-rendered; it is hydrated on the client instead.**

Add the `'use client';` directive as the **first line** of a component file to
explicitly force client-side rendering (hydration) in either case above:

```tsx
'use client';

import { useState } from 'react';

// ...an interactive component that must run in the browser...
```

- **Use `'use client';` for all interactive components where hydration is
  required for animation or interactivity** — anything with client state,
  effects, event handlers, timers, or transitions that must run after load
  (tabs, carousels, accordions, etc.). Without it, an otherwise SSR-capable
  interactive component is server-rendered as static HTML and never hydrates, so
  its interactivity is lost.
- Apply it to **both the parent and the interactive child** components of a
  slot-splitting group (e.g. a tabs parent and its tab items) so both hydrate.
- A component that branches on **`isCanvasEditorMode()`** (or otherwise renders
  editor-specific UI) MUST use `'use client';`. `isCanvasEditorMode()` needs the
  browser, so it is always `false` under SSR — without hydration the editor
  render would never appear.
- A component that renders differently before and after hydration (progressive
  enhancement) MUST keep its first client render identical to its server render
  to avoid a hydration mismatch. See the `stories` skill for how to test the
  pre-hydration / no-JS render.

> **TODO (confirm):** Determine whether a slot child that is _not_
> SSR-compatible (e.g. a data-fetching child) forces its parent to also be
> non-SSR — i.e. does an SSR-capable parent stay server-rendered when it
> contains a client-only child, or does the parent fall back to client-side
> rendering as well?

## TypeScript documentation

All components are written in TypeScript (`.tsx`). Types describe the shape;
short `/** ... */` comments describe intent. Do NOT use JSDoc `@param` tags —
express prop types as a TypeScript `interface`.

### Main component

Every exported component gets a short `/** ... */` description above it (1-3
sentences explaining what it does) and a `<PascalName>Props` interface above
that declaring its props.

```tsx
interface PromoCardProps {
  /** Card heading text. */
  heading?: string;
  /** Body copy displayed below the heading. */
  text: string;
  /** Text color theme. */
  textColor?: 'Light' | 'Dark';
  /** Background image source and alt text. */
  image?: { src: string; alt?: string };
}

/**
 * Promotional card with heading, body text, and optional background media.
 * Supports multiple color themes and an optional call-to-action link.
 */
const PromoCard = ({
  heading,
  text,
  textColor = 'Light',
  image,
}: PromoCardProps) => {
```

**Props format rules:**

- Declare props as an `interface <PascalName>Props` immediately above the
  component. Only export it (`export interface …`) if another module already
  imports it.
- Optional props end with `?:` (`heading?: string`); required props do not.
- Default values live in the destructuring signature, NOT in the type
  (`textColor = 'Light'`).
- Union string types stay inline for narrow unions; extract to a `type` alias
  when the same union appears more than once or has 4+ members
  (`type TextColor = 'Light' | 'Dark';`).
- Nested object shapes can be inline (`image?: { src: string; alt?: string }`)
  or extracted to their own `interface` when reused or non-trivial.
- Each prop gets a `/** ... */` comment on the line above it. End with a period.

### CVA variants

Type CVA variant prop objects with a `type` alias. Export the resulting variant
function directly — its type is inferred by CVA. Add an explicit return-type
annotation only when the function is part of an exported API and you want to
lock the signature.

```tsx
type ButtonVariantProps = {
  /** Visual style variant. */
  variant?: 'Solid' | 'Outline Dark' | 'Link';
};

/** Button visual style classes. */
export const buttonVariants: (props?: ButtonVariantProps) => string = cva(
  'inline-flex items-center',
  {
    variants: {
      variant: {
        Solid: 'bg-primary-600 text-white',
        'Outline Dark': 'border border-gray-900 text-gray-900',
        Link: 'text-primary-600 underline',
      },
    },
  },
);
```

#### Guard string-keyed variants with `satisfies Record<Union, string>`

CVA infers each variant object's key type from the object itself, so a mismatch
between the TS prop union and the CVA config keys is silent — neither TypeScript
nor CVA will flag it. Annotate each string-keyed variant object with
`satisfies Record<Union, string>` so a rename or missing case in the union
produces a type error at the CVA config.

```tsx
// ✅ GOOD: `satisfies` ties the variant keys to the source union
const containerVariants = cva('flex w-full flex-col', {
  variants: {
    layout: {
      'Left aligned': 'items-start text-left',
      'Center aligned': 'items-center text-center',
      'Right aligned': 'items-end text-right',
    } satisfies Record<HeadingLayout, string>,
  },
});

// ❌ BAD: renaming a member of HeadingLayout does not surface here
const containerVariants = cva('flex w-full flex-col', {
  variants: {
    layout: {
      'Left aligned': 'items-start text-left',
      'Center aligned': 'items-center text-center',
      'Right aligned': 'items-end text-right',
    },
  },
});
```

Skip the annotation for boolean-keyed variants (`{ true: …, false: … }`) — the
key type is already fixed by TypeScript.

### Custom hooks

Type the parameters and return value directly.

```tsx
interface ScrollProgress {
  containerRef: React.RefObject<HTMLDivElement>;
  progress: number;
  completed: boolean;
}

/**
 * Hook that tracks vertical scroll progress within a container.
 * Returns 0 at the top and 1 when scrolled to the midpoint.
 */
const useScrollProgress = (enabled: boolean): ScrollProgress => {
```

### Helper functions

Single-line `/** */` for simple functions. Types go on the parameters and (when
non-obvious) the return.

```tsx
/** Retrieve the cached value from localStorage, or null. */
const getCachedValue = (): string | null => { ... };

/** Clamp `value` between `min` and `max`. */
const clamp = (value: number, min: number, max: number): number => { ... };
```

### Constants

Single-line `/** */` describing purpose. Include units where relevant. Types are
usually inferred; annotate only when narrowing matters.

```tsx
/** Delay in ms before the heading fade-in starts after entering the viewport. */
const FADE_OUT_MS = 600;

/** localStorage key for persisting the user's preference. */
const STORAGE_KEY = 'user_preference';

/** Easing function: cubic ease-out for smooth scroll deceleration. */
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
```

### Sub-components

Internal sub-components within a file get a short 1-2 line description and their
own props interface when they receive props.

```tsx
interface HorizontalLayoutProps {
  headingPart1: string;
  headingPart2: string;
  video: ReactNode;
}

/**
 * Horizontal split layout: left and right headings flanking a centered video,
 * with body text below the right heading.
 */
const HorizontalLayout = ({
  headingPart1,
  headingPart2,
  video,
}: HorizontalLayoutProps) => {
```

### Inline code comments

Use sparingly, only for non-obvious logic. Prefer a comment block above the
relevant code explaining _why_, not _what_.

```tsx
// Explicitly play/pause video on intersection — mobile browsers often
// ignore autoPlay for fixed-positioned videos inside clipPath containers.
useEffect(() => { ... });
```

## Styling conventions

- Use Tailwind's theme colors (`primary-*`, `gray-*`) defined in `global.css`.
- Avoid hardcoded color values; use theme tokens instead.
- Follow the existing focus, hover, and active state patterns from examples.

## Tailwind 4 theme variables

This project uses Tailwind CSS 4's `@theme` directive to define design tokens in
`global.css`. Variables defined inside `@theme { }` automatically become
available as Tailwind utility classes.

**Always check `global.css` for available design tokens.** The `@theme` block is
the source of truth for colors, fonts, breakpoints, and other design tokens in
this project.

### How theme variables map to utility classes

When you define a CSS variable in `@theme`, Tailwind 4 automatically generates
corresponding utility classes based on the variable's namespace prefix:

| CSS Variable in `@theme`    | Generated Utility Classes                                  |
| --------------------------- | ---------------------------------------------------------- |
| `--color-primary-600: #xxx` | `bg-primary-600`, `text-primary-600`, `border-primary-600` |
| `--color-gray-100: #xxx`    | `bg-gray-100`, `text-gray-100`, `border-gray-100`          |
| `--font-sans: ...`          | `font-sans`                                                |
| `--breakpoint-md: 48rem`    | `md:` responsive prefix                                    |

The pattern is: `--{namespace}-{name}` becomes `{utility}-{name}`.

### Examples

Given this definition in `global.css`:

```css
@theme {
  --color-primary-600: #1899cb;
  --color-primary-700: #1487b4;
}
```

You can use these colors with any color-accepting utility:

```tsx
// ✅ GOOD: Using theme tokens via utility classes
<button className="bg-primary-600 hover:bg-primary-700 text-white">
  Click me
</button>

<div className="border border-primary-600">
  Bordered content
</div>

<span className="text-primary-600">
  Colored text
</span>
```

```tsx
// ❌ AVOID: Hardcoding hex values when theme tokens exist
<button className="bg-[#1899cb] text-white hover:bg-[#1487b4]">Click me</button>
```

Arbitrary values (e.g., `bg-[#xxx]`) are acceptable for rare, one-off cases
where adding a theme variable would be overkill. However, if a color appears in
multiple places or represents a brand/design system value, add it to `@theme`
instead.

### Semantic aliases

Theme variables can reference other variables to create semantic aliases:

```css
@theme {
  --color-primary-700: #1487b4;
  --color-primary-dark: var(--color-primary-700);
}
```

Both `bg-primary-700` and `bg-primary-dark` will work. Use semantic aliases when
they better express intent (e.g., `primary-dark` for a darker brand variant).

### Adding or updating theme variables

When a design requires a color, font, or other value not yet defined in the
theme, add it to the `@theme` block in `global.css` rather than hardcoding the
value in a component.

**When to add new theme variables:**

- A design introduces a new brand color or shade
- You need a semantic alias for an existing value (e.g., `--color-accent`)
- The design uses a specific spacing, font, or breakpoint value repeatedly

**When to update existing theme variables:**

- The brand colors change (update the hex values)
- Design tokens need adjustment across the system

**Example - adding a new color:**

```css
@theme {
  /* Existing tokens */
  --color-primary-600: #1899cb;

  /* New token for a success state */
  --color-success: #22c55e;
  --color-success-dark: #16a34a;
}
```

After adding, you can immediately use `bg-success`, `text-success-dark`, etc.

**Keep the theme organized.** Group related tokens together with comments
explaining their purpose. Follow the existing naming conventions in `global.css`
(e.g., numbered shades like `primary-100` through `primary-900`, semantic names
like `primary-dark`).

## Color props must use variants, not color codes

**Never create props that allow users to pass color codes** (hex values, RGB,
HSL, or any raw color strings). Instead, define a small set of human-readable
variants using CVA that map to the design tokens in `global.css`.

**Always check `global.css` for available design tokens.** The tokens defined
there (such as `primary-*`, `gray-*`, etc.) are the source of truth for color
values in this project.

**Wrong - allowing raw color values:**

```yaml
# ❌ BAD: Allows arbitrary color codes as prop values
props:
  properties:
    backgroundColor:
      title: Background Color
      type: string
      examples:
        - '#3b82f6'
```

```tsx
// ❌ BAD: Uses inline style with raw color value
const Card = ({ backgroundColor }: { backgroundColor: string }) => (
  <div style={{ backgroundColor }}>{/* ... */}</div>
);
```

**Correct - using CVA variants with design tokens:**

```yaml
# ✅ GOOD: Offers curated color scheme options
props:
  properties:
    colorScheme:
      title: Color Scheme
      type: string
      enum:
        - default
        - primary
        - muted
        - dark
      meta:enum:
        default: Default (White)
        primary: Primary (Blue)
        muted: Muted (Light Gray)
        dark: Dark
      examples:
        - default
```

```tsx
// ✅ GOOD: Uses CVA variants mapped to design tokens
import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

const cardVariants = cva('rounded-lg p-6', {
  variants: {
    colorScheme: {
      default: 'bg-white text-black',
      primary: 'bg-primary-600 text-white',
      muted: 'bg-gray-100 text-gray-700',
      dark: 'bg-gray-900 text-white',
    },
  },
  defaultVariants: {
    colorScheme: 'default',
  },
});

interface CardProps {
  colorScheme?: 'default' | 'primary' | 'muted' | 'dark';
  children: ReactNode;
}

const Card = ({ colorScheme, children }: CardProps) => (
  <div className={cardVariants({ colorScheme })}>{children}</div>
);
```

This approach ensures:

- Consistent colors across the design system
- Users select from curated, meaningful options (not arbitrary values)
- Easy theme updates by modifying `global.css` tokens
- Better accessibility through tested color combinations

## Layout, spacing, and position props must use options, not raw numbers

The same rule as colors applies to layout. **Never expose raw pixel, integer, or
`number` props to control spacing, offsets, sizing, or positioning.** Authors
edit in the CMS and cannot reason about pixels — a prop like
`contentOffset: 200` or `topSpacing: 96` is meaningless to them and trivial to
break.

Model the _intent_ with a **boolean** (renders as a checkbox) or an **enum**
(`meta:enum` select) that maps to the tuned values _inside_ the component:

```yaml
# ❌ BAD: raw pixel offsets — not editor-friendly
props:
  properties:
    contentOffset: { title: Content Offset, type: integer, examples: [200] }
    topSpacing: { title: Top Spacing, type: integer, examples: [96] }
```

```yaml
# ✅ GOOD: named options the author understands; the pixels live in the component
props:
  properties:
    raiseContent:
      title: Raise Content
      type: boolean
      examples: [false]
    looseSpacing:
      title: Loose Spacing
      type: boolean
      examples: [false]
```

```tsx
// The tuned constant lives in code, never in the prop.
const LOOSE_SPACING_PX = 96;
```

Reserve `integer`/`number` props for genuine content quantities an author truly
types (a countdown target, a column count) — never for design tuning.

## Component metadata

Every `<component_name>.component.yml` must include these top-level keys:

```yaml
name: Component Name # Human-readable display name
machineName: component_name # Machine name in snake_case
status: true # Whether the component is enabled
required: [] # Array of required prop names
props:
  properties:
    # ... prop definitions
slots: [] # Array of slot definitions or empty
```

**Props must have title and examples.**

Every prop definition must include a `title` for the UI label. The `examples`
array is required for required props and recommended for all others. Only the
first example value is used by Drupal Canvas.

```yaml
props:
  properties:
    heading:
      title: Heading
      type: string
      examples:
        - Enter a heading...
```

**Descriptions are optional but useful for non-obvious props.**

Add a `description` field when the title alone is ambiguous or the behavior
needs clarification. Don't add descriptions to self-explanatory props — they
take up screen real estate in the editor UI.

```yaml
# ✅ GOOD: Description clarifies non-obvious behavior
copyrightYear:
  title: Copyright Year
  type: string
  description:
    The year the site is copyrighted. If empty, shows the current year.

# ✅ GOOD: Title is ambiguous without context
title:
  title: Title
  type: string
  description: The quoted person's role or position.

# ❌ BAD: Description just restates the title
heading:
  title: Heading
  type: string
  description: The heading text.
```

**Prop IDs must be camelCase versions of their titles.**

The prop ID (the key under `properties`) must be the camelCase conversion of the
`title` value.

```yaml
# Correct - prop ID is camelCase of title
props:
  properties:
    buttonText:           # camelCase of "Button Text"
      title: Button Text
      type: string
    backgroundColor:      # camelCase of "Background Color"
      title: Background Color
      type: string
    isVisible:            # camelCase of "Is Visible"
      title: Is Visible
      type: boolean

# Wrong - prop IDs don't match titles
props:
  properties:
    btn_text:             # should be "buttonText" for title "Button Text"
      title: Button Text
    bgColor:              # should be "backgroundColor" for title "Background Color"
      title: Background Color
```

## Syncing prop changes with pages (`canvas push`)

`npx canvas push` is **atomic** and validates each page against the component
schema **already committed on the CMS** — not the schema being pushed in the
same run. Component config commits independently of pages; pages are validated
separately; and if any item fails, the whole batch rolls back (`push/fail`).
Consequences:

- **A new prop that an existing page will set takes TWO pushes:**
  1. Push the component with the new prop while no page references it — commits
     the schema (isolate with `--no-pages`, see below).
  2. Add the prop to the page and push again — now it validates.

  Doing both in one push fails on the page
  (`Component ...: the '<prop>' prop is not defined`), and because the push is
  atomic that failure rolls back the component's prop change too — so nothing
  lands. The component PATCH itself returns HTTP 200; the batch just rolls back.
  It's a rollback, not a rejection, and **not** an "in-use component"
  restriction — a new prop applies fine to a component already on a page, as
  long as no page references it in that push.

- **`sync.pages: true` in `canvas.config.json` means a plain `npx canvas push`
  INCLUDES pages.** So if ANY page is currently invalid (e.g. it already
  references a prop the committed schema lacks), every plain push fails on that
  page and rolls back your component change — the prop never lands, optional or
  required. Push component-schema changes in isolation with
  `npx canvas push --no-pages` (add `--no-regions --no-content-templates` to
  scope to components only), then push the page(s) separately.

- **Making a prop `required`** commits fine on a component-only push, but every
  page instance of that component must already set the prop — otherwise the
  _page_ push fails (`elements.<uuid>.props.<prop>:` required-value error) and
  rolls back. So set the prop on all pages first, then flip `required`.

- `npx canvas validate` checks your LOCAL `<component_name>.component.yml`, so
  it passes even when the remote schema is stale. Trust the push outcome, not
  just validate; verify with `GET /canvas/api/v0/config/js_component/<machine>`.

## Prop types

### Text

Basic text input. Stored as a string value.

```yaml
type: string
examples:
  - Hello, world!
```

### Formatted text

Rich text content with HTML formatting support, displayed in a block context.

```yaml
type: string
contentMediaType: text/html
x-formatting-context: block
examples:
  - <p>This is <strong>formatted</strong> text with HTML.</p>
```

### Link

URL or URI reference for links to internal or external resources.

```yaml
type: string
format: uri-reference
examples:
  - /about/contact
```

**Note:** The format can be either `uri` (accepts only absolute URLs) or
`uri-reference` (accepts both absolute and relative URLs).

**IMPORTANT: Use proper path examples for URL props.** Do not use `#` as an
example value for `uri-reference` props—it can cause validation failures during
upload. Always use realistic path-like examples:

```yaml
# ✅ Correct - proper path examples
examples:
  - /resources
  - /about/team
  - https://example.com/page

# ❌ Wrong - can cause upload failures
examples:
  - "#"
  - ""
```

**Preserve external links verbatim.** When migrating, a link that points to a
different domain must keep its full absolute URL — copy it verbatim; never
rewrite it to a relative or internal equivalent (that would send users to a dead
local route). **Preserve the source's new-tab behaviour rather than forcing
it:** if the source opens the link in a new tab (`target="_blank"`, with
`rel="noopener noreferrer"`), reproduce that; if it doesn't, don't add it.

### Image

Reference to an image object with metadata like alt text, dimensions, and file
URL. Only the file URL is required to exist, all other metadata is always
optional.

```yaml
type: object
$ref: json-schema-definitions://canvas.module/image
examples:
  - src: >-
      https://images.unsplash.com/photo-1484959014842-cd1d967a39cf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80
    alt: Woman playing the violin
    width: 1770
    height: 1180
```

### Video

Reference to a video object with metadata like dimensions and file URL. Only the
file URL is required to exist, all other metadata is always optional.

```yaml
type: object
$ref: json-schema-definitions://canvas.module/video
examples:
  - src: https://media.istockphoto.com/id/1340051874/video/aerial-top-down-view-of-a-container-cargo-ship.mp4?s=mp4-640x640-is&k=20&c=5qPpYI7TOJiOYzKq9V2myBvUno6Fq2XM3ITPGFE8Cd8=
    poster: https://example.com/600x400.png
```

### Boolean

True or false value.

```yaml
type: boolean
examples:
  - false
```

### Integer

Whole number value without decimal places.

```yaml
type: integer
examples:
  - 42
```

### Number

Numeric value that can include decimal places.

```yaml
type: number
examples:
  - 3.14
```

### List: text

A predefined list of text options that the user can select from.

```yaml
type: string
enum:
  - option1
  - option2
  - option3
meta:enum:
  option1: Option 1
  option2: Option 2
  option3: Option 3
examples:
  - option1
```

### List: integer

A predefined list of integer options that the user can select from.

```yaml
type: integer
enum:
  - 1
  - 2
  - 3
meta:enum:
  1: Option 1
  2: Option 2
  3: Option 3
examples:
  - 1
```

## Enum value naming

Enum values must use lowercase, machine-friendly identifiers. Use `meta:enum` to
provide human-readable display labels for the UI.

**Note:** Enum values cannot contain dots.

```yaml
# Correct
enum:
  - left_aligned
  - center_aligned
meta:enum:
  left_aligned: Left aligned
  center_aligned: Center aligned
examples:
  - left_aligned

# Wrong - using display labels as enum values
enum:
  - Left aligned
  - Center aligned
```

The `examples` value must be the enum value, not the display label.

### Enum values must match TSX component variants

When using class-variance-authority (CVA) or similar libraries in the TSX
component, the variant keys must exactly match the enum values defined in
`<component_name>.component.yml`.

```tsx
// <component_name>.component.yml defines: enum: [left_aligned, center_aligned]
// CVA variants must match:
const variants = cva('base-classes', {
  variants: {
    layout: {
      left_aligned: 'text-left', // matches enum value
      center_aligned: 'text-center', // matches enum value
    },
  },
});
```

## TypeScript unions may be wider than YAML enums

`<component_name>.component.yml` describes the values a Canvas author can pick
from the editor UI. The TS prop type describes every value the component will
accept — which is the YAML enum PLUS any "internal-only" options a parent
component may pass programmatically. So the TS union **may equal or be a
superset of** the YAML enum, never a subset (the editor must never produce a
value the component rejects).

**Prefer the full source-owned union.** When a source-owned union already
exports the union you'd narrow to a subset, import and use it directly. The
extra values are legitimate escape hatches for parent components, and preserving
the tie to the source means a rename in the owner surfaces as a compile error
here instead of silent drift. Document the curated YAML subset in a `/** ... */`
note above the prop.

```tsx
import type { ButtonVariant } from '@/components/button';

interface CardProps {
  // YAML enum: [Solid, Outline Dark, Link, Link Underline]
  /**
   * Button variant for the call-to-action. Canvas authors see a curated
   * 4-of-N subset via `component.yml`; the full `ButtonVariant` union is
   * accepted for programmatic use from parent components.
   */
  linkVariant?: ButtonVariant;
}
```

**Only narrow with `Extract<>` when you want to _forbid_ the extra values**
(rare — usually the extras are legitimate internal escape hatches). If the
component's code path genuinely can't handle the wider union, narrow it:

```tsx
import type { ButtonVariant } from '@/components/button';

interface StrictCardProps {
  // Only these four render correctly here; other ButtonVariant values would
  // break the layout, so the TS type must forbid them.
  linkVariant?: Extract<
    ButtonVariant,
    'Solid' | 'Outline Dark' | 'Link' | 'Link Underline'
  >;
}
```

**When there is no source union** (integer enums, one-off value sets), spell the
literal union directly:

```tsx
interface ListingProps {
  // YAML: enum: [10, 25, 50, -1]
  pageSize?: 10 | 25 | 50 | -1;
}
```

## Internal JSX-only props

Some props are useful for parent components to forward programmatically but
should NOT appear as Canvas author controls. Keep them in the TS `interface`
without a matching entry in `<component_name>.component.yml`, and annotate them
with a JSDoc note explaining the intentional asymmetry.

The doc note signals to reviewers that the YAML-vs-TS mismatch is deliberate,
not drift.

```tsx
import type { Gap } from '@/components/grid';

interface PromoBannerProps {
  /**
   * Grid gap forwarded to the inner grid. Not exposed via
   * `component.yml` — a parent can tune spacing programmatically.
   */
  gap?: Gap;
}
```

The asymmetry only ever runs one direction — TS has the prop, YAML lacks it. The
reverse (a YAML prop with no TS field) is always a bug: the editor would set a
value the component silently drops.

## Slots

Slots allow other components to be embedded within a component. In React, slots
are received as props containing the rendered children.

```yaml
slots:
  content:
    title: Content
  buttons:
    title: Buttons
```

In the TSX component, slots are destructured as props (typed as `CanvasSlot`)
and rendered directly:

```tsx
import type { CanvasSlot } from '@freelygive/canvas-utils/types';

interface SectionProps {
  width?: 'Narrow' | 'Wide';
  content?: CanvasSlot;
}

const Section = ({ width, content }: SectionProps) => {
  return <div className={sectionVariants({ width })}>{content}</div>;
};
```

`CanvasSlot` is a semantic alias for the slot shape (a `ReactNode` in client
contexts, an HTML string on the server / in the editor). Use it for any prop
listed under `slots:` in the YAML; keep `ReactNode` for JSX-only children such
as a `Button`'s `children` or a wrapper sub-component's `children`.

Use an empty array when the component has no slots:

```yaml
slots: []
```

### Repeated slot children must be registered components

Content that repeats inside a slot (nav links, social icons, cards, list items)
and that an author should edit **must be its own registered component** (its own
folder + `<component_name>.component.yml`) — not a named export from another
component's file, and not inline markup. Only registered components can be
referenced by `type` in Canvas page/region JSON. A link renderer exported as a
named function from another component's file renders in a Storybook story but
cannot be placed in a slot by an author or referenced in a region spec — promote
it to its own `src/components/<name>/` folder with a
`<component_name>.component.yml`.

## Animation and interactive states

Components can be server-rendered and hydrate on the client, so animation and
hover code must degrade safely — and must be **verified by driving a real
browser** (agent-browser), not by eye. Storybook alone does not surface
SSR/hydration failures.

- **Scroll-reveal must never hide content permanently.**
  `gsap.from({ autoAlpha: 0, ... })` on a `ScrollTrigger` renders its hidden
  start-state immediately; if the trigger never fires — common under SSR, when
  the element is below the fold at hydration or the trigger mis-measures — the
  content stays invisible forever. Always pass **`immediateRender: false`** so
  the element is visible by default and only hides transiently when the trigger
  actually plays. Guard all animation on `prefers-reduced-motion`.
- **Prefer a component `<component_name>.css` for non-trivial hover /
  rollover.** Tailwind arbitrary-value variant utilities such as
  `group-hover:-translate-y-[150px]` can silently fail to compile and emit **no
  rule at all**, so the interaction does nothing. Explicit CSS in the
  component's `<component_name>.css` (auto-loaded by Canvas and Storybook) is
  reliable. Note Tailwind 4 `translate-*` sets the CSS `translate` property, not
  `transform` — inspect the right property when debugging a "dead" transition.
- **`overflow: clip` clips every edge.** If you clip a component to contain
  decorative overflow (to kill a horizontal scrollbar or dead space below the
  footer), it also clips content that is _meant_ to overflow (a decoration
  overlapping the section above). Extend the box (negative `margin` + matching
  `padding`) to move the clip edge, and pair `pointer-events: none` on the
  clipped box with `pointer-events: auto` on the real content so an enlarged
  transparent area cannot block clicks (e.g. a hero button) beneath it.
