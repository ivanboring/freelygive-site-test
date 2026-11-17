---
name: create-component
description:
  Step-by-step guide for creating new components from scratch including folder
  structure and naming conventions
---

# Creating new components

When asked to create a new component:

1. Browse `src/components/` to find a similar component that can serve as a
   starting point (e.g., use `blockquote` as a base for an "alert" component, or
   `button` for any interactive element)
2. Copy the component folder to `src/components/<new_name>/` — this brings the
   entry, metadata, and colocated story (and any test) files along with it
3. Rename the copied files to the new component name
4. Modify the copied files to implement the new component

**CRITICAL: Every component MUST have its own individual story file, colocated
in the component folder.** The story file naming convention is
`<component_name>.stories.tsx` (`snake_case`, the same base name as the
component); any play-function test file is `<component_name>.tests.tsx`.

This approach ensures consistent patterns for `<name>.component.yml` structure,
TypeScript conventions, and Storybook story format across all components.

**Example:** To create a new "Alert" component based on the Blockquote example:

```bash
cp -r src/components/blockquote src/components/alert
# Rename the entry, metadata, and story files to match the new component name.
git mv src/components/alert/blockquote.tsx src/components/alert/alert.tsx
git mv src/components/alert/blockquote.component.yml src/components/alert/alert.component.yml
git mv src/components/alert/blockquote.stories.tsx src/components/alert/alert.stories.tsx
```

Then modify the copied files to implement the Alert component.

Components use the `@/components` import alias, which points to
`src/components`. When you copy and modify exisiting components, the imports
will work automatically.

## Component naming conventions

**Use simple, generic names.** Never prefix component names with the project or
site name. Components should be reusable and their names should describe their
purpose, not their origin.

```
# Correct - simple, descriptive names
footer
hero
navigation
contact_form

# Wrong - prefixed with project/site name
nebula_footer
acme_hero
mysite_navigation
projectx_contact_form
```

This ensures components remain portable and their names clearly communicate
their function rather than their project context.

## Reuse existing components

**Always check `src/components/` before creating new UI elements.** When
building a component that needs common UI elements (buttons, headings, images,
etc.), import and use existing components rather than duplicating their
functionality.

```tsx
// ✅ GOOD: Import and use the existing button component
import Button from '@/components/button';

const NewsletterSignup = ({ onSubmit }: { onSubmit: () => void }) => (
  <form onSubmit={onSubmit}>
    <input type="email" placeholder="Enter your email" />
    <Button variant="primary">Subscribe</Button>
  </form>
);
```

```tsx
// ❌ BAD: Duplicating button styles instead of reusing the component
const NewsletterSignup = ({ onSubmit }: { onSubmit: () => void }) => (
  <form onSubmit={onSubmit}>
    <input type="email" placeholder="Enter your email" />
    <button className="rounded bg-primary-600 px-4 py-2 text-white">
      Subscribe
    </button>
  </form>
);
```

This ensures visual consistency, reduces duplication, and makes updates easier
since changes to a shared component automatically apply everywhere it's used.

**Design components for composability.** By default, avoid building layout
constraints (like `max-width` or centering) into individual components. Layout
components such as `section` handle width constraints when composing pages, so
most components should remain flexible and adapt to their container.

Include built-in layout constraints when the component doesn't make sense in any
other layout context (such as `header` or `footer`), or when the design
specifically requires it.

```tsx
// ✅ GOOD: Component adapts to its container width
interface CardProps {
  title: string;
  children: ReactNode;
}
const Card = ({ title, children }: CardProps) => (
  <div className="rounded-lg border p-4">
    <h3>{title}</h3>
    {children}
  </div>
);
```

```tsx
// ❌ BAD: Component has built-in width constraints (limits composability)
const Card = ({ title, children }: CardProps) => (
  <div className="mx-auto max-w-md rounded-lg border p-4">
    <h3>{title}</h3>
    {children}
  </div>
);
```

## Required component folder structure

**CRITICAL:** Every component folder in `src/components/` MUST contain two
files, both named after the component (not `index`):

```
src/components/<component_name>/
├── <component_name>.tsx           # React component source code (REQUIRED)
└── <component_name>.component.yml # Component metadata and props (REQUIRED)
```

Optionally, a sibling `<component_name>.css` file is auto-loaded by Storybook
and Canvas when it exists.

**Never create a component folder without both required files.** The
`<component_name>.tsx` contains the actual React component implementation. The
`<component_name>.component.yml` defines the component's metadata, props, and
slots for Drupal Canvas. The named-metadata convention (`<name>.component.yml`,
not `component.yml`) is what tells the Canvas CLI to use `<name>.tsx` as the
entry file rather than `index.tsx`.

The directory name must match machineName. The component folder name must
exactly match the `machineName` value defined in `<name>.component.yml`, and
must also match the base name of the entry and metadata files. Use `snake_case`
as the preferred format, though `kebab-case` is also supported.

After creating components, verify the folder structure:

```bash
# List all component folders and their contents
ls -la src/components/*/

# Verify each new component has both required files
ls src/components/<component_name>/<component_name>.tsx
ls src/components/<component_name>/<component_name>.component.yml
```

If a component folder is missing either file — or still uses the legacy
`index.*` / bare `component.yml` names — the component is incomplete and will
not work correctly.

### Multiple components per folder

A single folder MAY contain more than one component when they're tightly coupled
(e.g. `tabs` and `tab_item`). Each component gets its own pair of `<name>.tsx` +
`<name>.component.yml` files in the same directory. This works because the
Canvas CLI discovers components by the `<name>.component.yml` filename, not by
folder name.

## Internal components

For internal re-use that should not be exposed to content editors via the
library of components, ensure you set `status: false` in the
`<component_name>.component.yml` file.

## Common utilities

Utility/helper functions can be placed in a `utils_<name>` component with a
React component as the default export. These should always be internal
components, so `status: false` MUST be set in the `utils_<name>.component.yml`
file.

## Stories

Every non-internal component should have a corresponding story file colocated in
its folder (`src/components/<component_name>/<component_name>.stories.tsx`).
Where appropriate, internal components should also have a story file.

Use the stories skill when creating or modifying stories.
