---
name: acquia-source-publish
description:
  How to take a built and QA'd page live on the connected Acquia Source site -
  push the components safely, create the Canvas page, publish it, set it as the
  front page when asked, and verify from the public URL. Use when the user asks
  to put a page on their site, make it live, publish it, or make it the front
  page, and when a publish step fails (503, expired token, dead MCP session,
  duplicates, staged homepage).
---

# Publishing a built page to Acquia Source

Prerequisites: the page passed `qa-review`; `.env` holds `CANVAS_SITE_URL`,
`CANVAS_CLIENT_ID`, `CANVAS_CLIENT_SECRET` (and `CANVAS_SCOPE` when the site
uses non-default scopes). The invariants in `AGENTS.md` ("Publishing to Acquia
Source") apply throughout; this skill is the procedure. Detail on failure modes
lives in `references/troubleshooting.md`: read it when a step fails, not before.

## 1. Preflight the component set (read-only)

1. Get a token: `POST CANVAS_SITE_URL/oauth/token`, form-encoded,
   `grant_type=client_credentials` with the `.env` client id and secret (add
   `scope=$CANVAS_SCOPE` only when set). Read the expiry from the response (300
   seconds observed) and mint a fresh token for every new step rather than
   reusing. Never echo the token.
2. List the components already on the site:
   `GET CANVAS_SITE_URL/canvas/api/v0/config/js_component` with the bearer
   token. Record their machine names.
3. Compare with `src/components`. The push mirrors the local set by name: a
   remote component with no local counterpart would be deleted, a remote
   component with a local one of the same name would be overwritten. If any such
   component exists that you did not create in this session, stop and show the
   user the list; do not push.

## 2. Authorise the push on that exact delta

Show the user in plain words what the push will add and update on the live site
(the preflight result). Then resolve `source-cli push authorisation`
(AGENTS.md): if it is `never`, ask the user to choose `ask per push`,
`ask each session` or `always allow` and persist the answer; with
`ask per push`, ask now. Without an authorising value, stop here. Every re-push
after a fix is a new push: it goes through steps 1 and 2 again.

## 3. Push components only

```
npx canvas push --no-pages --no-regions --no-content-templates
```

Run it without `-y` so the CLI's own confirmation shows what it is about to do;
confirm only if it matches the preflight. Then re-list the remote components and
confirm every pre-existing one is still there and yours are present. If the push
failed with a 5xx, do not re-run it blindly: re-list first (see troubleshooting,
"503 after a successful write").

## 4. Create and publish the page through the site's MCP

The site exposes MCP at `CANVAS_SITE_URL/mcp` (JSON-RPC over HTTP; no MCP client
is configured in this project, so call it directly with the bearer token).

1. Handshake: `initialize`, take `mcp-session-id` from the **response headers**,
   send `notifications/initialized`, and pass that header on every later call.
2. Discover: `tools/list` and `resources/list`. Page create, add components,
   publish and a page read (`list_entities`) are required; set homepage and
   auto-save publish only when the user asked for the front page. If a required
   one is missing, stop and report which.
3. **List before you create**: `list_entities` for pages. If a page with your
   intended title or alias already exists, reuse it only when you can show it is
   yours: created earlier in this session, or by the attempt you are reconciling
   (same title, your components on it, status draft). Any other match is someone
   else's page: stop, report the collision, and do not touch it.
4. Create the page (`create_canvas_page`), add the built components in order
   (`batch_add_components_to_page`), publish (`publish_canvas_page`). `page_id`
   is an integer.
5. Front page, only if the user asked: read `canvas://auto-saves` and record the
   entries; call `set_homepage`; read `canvas://auto-saves` again and take the
   single new entry. If the delta is not exactly one entry, stop and ask. Pass
   that entry's `autosave_key` and `data_hash` to `publish_auto_saves`. Never
   publish entries you did not create. Then read the site's front page setting
   back (or fetch the public root URL) before saying it is set.

## 5. Verify from the outside

Fetch the public site URL (the one visitors use, which may differ from
`CANVAS_SITE_URL`; a shield password, if any, is in `.env` as
`ABP_SERVED_SHIELD_PASSWORD`). Confirm the migrated page renders and, if asked,
is the front page. Then run the `qa-review` visual pass against the live page at
desktop and mobile: layout structure, columns, alignment and spacing, not only
content presence. If it needs fixing, fix locally, then start again from step 1
(preflight and authorisation apply to every push); re-pushing an unchanged build
changes nothing.

Report: page id, path, what was pushed (added / updated component names),
whether the front page was set, and anything you left untouched because it was
not yours.
