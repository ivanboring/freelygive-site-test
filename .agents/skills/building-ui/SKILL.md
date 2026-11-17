---
name: building-ui
description:
  How to build a site's pages and UI to the chosen build approach — faithfully
  rebuilding an existing source site (like-for-like, pixel-perfect or
  close-match) or building to a design system. Use when asked to recreate a
  website's or page's visual UI from a live URL or design reference (e.g. "copy
  the homepage of example.com onto my site", migrate or rebuild a site), or to
  build UI to a design system / component library.
---

# Building UI to a source or design system

Before building any UI, the **`build-approach`** session setting in `AGENTS.md`
must be resolved. If it is still `ask`/`UNSET`, ask the user which approach
applies and persist the answer (and its sub-choices) in `AGENTS.md` so it is not
asked again, then follow the matching section below.

**Content and imagery are always preserved exactly** — whichever approach and
fidelity apply, reproduce the real content and images as-is. Fidelity and the
design system govern only the visual styling and behaviour, never the content.

## Fidelity

The **fidelity** target (recorded alongside the approach) governs how closely
the visual build matches its reference — the source site for a like-for-like
build, or the design source for a design-system build.

- **Pixel-perfect** (`pixel-perfect`) — match the reference exactly: fonts,
  colours, spacing, and layout, plus all animations, transitions, and
  interactive behaviours.
- **Close match** (`close-match`) — preserve the branding, layout,
  functionality, and exact content and imagery, but don't chase pixel-perfection
  and don't fuss over every embellishment (fine animation / micro-interaction
  detail).

## Like-for-like builds (rebuilding a source site)

Applies when `build-approach` is `like-for-like`. Reproduce the source's exact
content, imagery, branding, layout, and functionality, matching its styling and
behaviour to the recorded fidelity (above). Treat the live source as the source
of truth: inspect its markup, computed styles, and behaviour with agent-browser,
and take exact assets (download files, copy SVGs verbatim, use the real font
files — mindful of licensing for commercial fonts). Compare your build against
the source before calling it done.

**Behaviour and motion are part of fidelity, not extras.** Many sites drive
load-in reveals and scroll-linked motion (parallax, scroll-scrubbed reveals)
with JS/GSAP that leaves no trace in a static screenshot. Characterise them by
observing the source **over time** (immediately after load) and **across scroll
positions** — sample the relevant elements' computed `transform`/`opacity` — and
reproduce them, degrading safely (gate on `prefers-reduced-motion`; keep the
no-JS base state fully visible). Reproducing decorative/animated layers can add
phantom page overflow — check `scrollHeight` against the real content bottom.

_(Detailed fidelity guidance to follow.)_

## Building to a design system

Applies when `build-approach` is `design-system`. Build components to the design
system rather than copying a source, to the recorded fidelity — at
`pixel-perfect` fidelity the components should match the **design source**
precisely (which may be an aggregation of several existing sites). **Content and
imagery are still preserved exactly** — never adapt or rewrite content to fit
the system. Follow the resolved **design-system source** and respect the
resolved **allowed divergence** — never exceed it.

- **design-system source** — where the system comes from:
  - derived from this site itself,
  - an external source (e.g. a Figma file), or
  - an existing component library.
- **allowed divergence** — how far this site may deviate:
  - `none` — use the system exactly.
  - `theme only` — retheme without changing structure.
  - `custom components` — add new components alongside the system.
  - `core divergence` — may modify the system's core/shared components.

When the system is an existing component library, prefer its components and
tokens over building new ones.

_(Detailed design-system guidance to follow.)_

## Either approach

Whichever approach applies, build with the `create-component`,
`component-authoring`, and `stories` skills, and verify animation, hover, and
interactivity in the real rendered site — not Storybook alone. When the build
(or a change to it) is ready, QA it with the **`qa-review`** skill — a required
step that checks content, responsive visuals, motion fidelity, overflow,
accessibility, and SEO across every page.
