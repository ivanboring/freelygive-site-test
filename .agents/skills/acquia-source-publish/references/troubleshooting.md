# Troubleshooting a Source publish

Read the section for the symptom you have. Every item below was observed on real
runs (2026-08-25/26) against an Acquia Source site; none is theoretical.

## 503 "Technical Difficulties" after a write

The site can return 503 AFTER a page create, page delete or region update has
already been applied. Treat every 5xx on a write as "outcome unknown":

1. Get a fresh token and a fresh MCP session (below).
2. Read the state: `list_entities` for pages,
   `GET /canvas/api/v0/config/js_component` for components,
   `GET /canvas/api/v0/config/page_region` for regions.
3. If the write landed, continue from the next step. If not, retry once.

Re-running the write without reading first is how duplicate pages, two headers
and two footers were created. If duplicates already exist, delete only the ones
you created (`delete_canvas_page` with `force: true` if components reference
them), then continue with the survivor.

Health check: a GET to `/` or `/oauth/token` returns 503 even when the site is
healthy. The only valid up-check is the token POST itself. If it returns 503,
wait 60 seconds and POST again.

## Expired token or dead MCP session

Tokens live about 300 seconds; MCP sessions die when the site restarts. Any 401,
or a JSON-RPC error about an unknown or missing session, means: mint a new
token, call `initialize` again, take the new `mcp-session-id` from the response
headers, send `notifications/initialized`, and continue with the new header.
Retrying the old call with the old session or token fails every time.

## `insufficient_scope`

Not a session problem; do not retry. Determine where it came from: the token
POST (the client is not granted the scope) or `/mcp` (the token lacks it).
Report which, and that the site's API client scopes and, if set, `CANVAS_SCOPE`
in `.env` need checking by the site owner. Never guess scope strings.

## The front page did not change

`set_homepage` only stages the change as an auto-save. Read
`canvas://auto-saves`, find the single entry that appeared after your call, and
pass its `autosave_key` and `data_hash` to `publish_auto_saves`. If you cannot
tell which entry is yours, stop and ask; publishing someone else's staged work
is not acceptable. Verify by reading the site's front page setting or fetching
the public URL, not from the call's 200.

## Push wants to delete or overwrite existing components

`npx canvas push` mirrors `src/components` onto the site by name. Anything on
the site that is missing locally is deleted; anything with the same name is
overwritten. If the preflight comparison (skill step 1) shows such components
that you did not create, do not push. Options for the user: add the missing
components to the local set first, or push only your components from a scoped
copy of the component directory. Never resolve this by pushing with `-y`.

## A global region broke (header/footer empty or "value should not be null")

A bad write can leave a global region with an empty value and a stuck auto-save
that the editor cannot discard. Regions you did not create are out of scope for
this procedure even when the owner asks: read the region
(`GET /canvas/api/v0/config/page_region/<id>`), report its state and the
components and versions it should hold, and propose the repair (PATCH the full
region content back with the current component versions, then
`discard_auto_saves` for the stuck entry). Carry it out only under a separate,
explicit instruction for that region, never as part of publishing a page.

## Publishing a component change fails with "prop is not defined"

A push that changes a component's props and a page that already uses the new
prop cannot land in one push (the batch rolls back). Push the component first
with `--no-pages`, then the page. See the `component-authoring` skill.

## Secrets

If a token or the client secret appeared in any output, say so in the report so
the owner can rotate it. Never paste `.env` contents to diagnose a problem;
report which variables are set, not their values.
