---
name: qa-review
description:
  QA a built or migrated UI against its source/reference in a real browser
  before calling it done — content, responsive visuals, interactions, animation
  & motion fidelity, layout/overflow, accessibility (axe + manual, as good or
  better than the source), and SEO. Use after building or changing any page or
  site (see building-ui), and after ANY change that touches layout, animation,
  or interaction.
---

# QA-reviewing a built UI

A build can pass a glance and still be wrong: the wrong wrap at one breakpoint,
an animation that never fires, a decorative layer that adds phantom scroll, a
component that renders fine on one page and breaks on another. This skill is the
systematic pass that catches those before you call the work done.

## When to use

- After building or migrating any page/site, before declaring it complete.
- After ANY change to layout, animation, interaction, or a shared/structural
  component — those are exactly the changes that regress silently.
- Especially for **like-for-like** migrations, where fidelity includes behaviour
  and motion, not just static appearance.

## Principles

- **Drive a real browser** (the `agent-browser` skill), not Storybook's static
  preview alone. Hydration, animation, scroll, and overflow bugs only appear in
  a real render.
- **Compare against the reference** — the source site for like-for-like, the
  design source otherwise — at the same breakpoints and the same scroll
  positions. When in doubt about intended behaviour, go measure the source; do
  not guess.
- **Check EVERY page, not one.** A shared component (header, footer, a
  decorative layer) can render differently per page because its container's
  context differs — a parent's `overflow`, height, or stacking context. "It
  works on the home page" does not mean it works everywhere.
- **Observe over time and across scroll, not just static snapshots.** Load-in
  and scroll-linked animations are invisible in a single screenshot — they are
  the single most-missed dimension.
- **Evidence before claims.** Re-screenshot and re-run the gates after every
  fix; only call it done with output in hand (see
  `verification-before-completion`).

## Dimensions — verify each, on each page

1. **Content parity.** Every heading, paragraph, label, and link. Preserve link
   URLs verbatim and the source's new-tab behaviour; preserve imagery exactly.
   Diff against the source rather than trusting memory.
2. **Responsive visuals.** Screenshot at desktop, tablet, and mobile and compare
   to the source at each. Watch the breakpoint wraps, spacing, and font sizes.
3. **Interaction & functionality.** Drive nav, links, hovers, menus (open AND
   close, and Escape), toggles, forms. Assert state — don't eyeball.
4. **Animation & motion fidelity.** On the SOURCE, sample computed
   transforms/opacity **over time** (load-in reveals) and **across scroll
   positions** (scroll-scrubbed parallax, reveal-on-scroll). Reproduce, then
   verify YOUR build's transforms match at the same scroll positions, on every
   animated page. Gate all motion on `prefers-reduced-motion`, and keep the
   no-JS / reduced-motion base state fully visible (never hide content behind a
   trigger that might not fire — see `component-authoring`).
5. **Layout & overflow sanity.** After adding absolutely-positioned,
   transformed, or decorative elements, check for phantom scroll: compare
   `document.documentElement.scrollHeight` to the real content bottom (e.g. the
   footer's bottom) — any gap is stray overflow you can scroll into. Check for
   unwanted horizontal scrollbars too. Contain decorative overflow by clipping
   at the layout wrapper (`overflow: clip`), which does NOT trap
   `position: fixed` children.
6. **Accessibility — as good or better than the source.** Run axe-core on the
   FULL document, per page (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`,
   `best-practice`). Then verify by hand: exactly one `<h1>` and a sane heading
   order; landmarks (`header`/`nav`/`main`/`footer`); `lang` matches the content
   language; descriptive link/`aria` names with an "opens in a new tab" cue on
   external links; a visible `:focus-visible` indicator on every interactive
   element; keyboard operability (Escape closes overlays, focus returns to the
   trigger); reduced-motion honoured. **Re-run axe after EACH change** — a
   well-meant addition (e.g. a skip link placed outside all landmarks) can
   introduce a new finding. Prefer WCAG-required fixes; weigh best-practice
   findings against their cost and note the trade-off.
7. **SEO.** Semantic HTML (a real `h1`, landmarks, `alt` text, descriptive link
   text, `lang`) is in scope and supports SEO. Document-level `<title>`, meta
   description, Open Graph, canonical, and JSON-LD are **CMS page-level** (set
   when the page is published in Canvas), NOT component concerns — flag them for
   whoever publishes; don't force them into components.

## Tooling recipes

`agent-browser` (full usage in the `agent-browser` skill) + axe-core, which
ships in `node_modules/axe-core/axe.min.js`.

- **Viewport:** set it with `agent-browser set viewport <w> <h>` (NOT
  `viewport`), and confirm it took effect (`window.innerWidth`). A `--full` page
  screenshot may still render at the layout width regardless of viewport — a
  viewport-only screenshot reflects the responsive width; verify before trusting
  a "mobile" capture.
- **`eval` async:** it awaits a returned Promise but forbids top-level `await`
  and `return`. Wrap async work in an IIFE that returns a Promise:
  `(()=>{ ...; return new Promise(res=>{ ... }); })()`.
- **Sampling animation across scroll:** scroll to a position, read
  `getComputedStyle(el).transform` / `.opacity`, repeat across positions;
  compare source vs build.
- **axe:** serve `axe.min.js` as a static asset (or inject it with a `<script>`
  tag), then `axe.run(document, { runOnly: [...] }).then(r => r.violations)`.
  Remove any temp asset afterwards so it isn't left in the build.
- **One browser driver at a time** — parallel browser sessions collide.

## Fix loop

Collect findings first, then dispatch parallel subagents to fix independent
groups partitioned by **disjoint files** (see `dispatching-parallel-agents`),
keeping a single browser-driving lead. Pass the resolved session settings to
every subagent, and forbid them from touching git / pushing / restarting the dev
server. When they finish, re-verify the whole set in the browser and re-run
`npm run code:check` (or scoped `eslint` + `tsc`) and `npx canvas validate`,
plus axe. Repeat until clean — with evidence.
