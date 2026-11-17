# Agent Access for Drupal

Agent Access brings Drupal to the AI tools people already use. People connect with their own
Drupal account, and Drupal's existing permissions apply.

The goal is to make Drupal's capabilities easier to use, with its content rules and editorial
workflows still in place.

Agent Access is a Drupal recipe that brings together
[Simple OAuth](https://www.drupal.org/project/simple_oauth),
[Tool API](https://www.drupal.org/project/tool), and
[MCP Server](https://www.drupal.org/project/mcp_server). It is part of the Drupal AI Initiative's
[Outside AI work](https://www.drupal.org/project/ai_initiative/issues/3576908).

## Status

Agent Access `1.0.x` is experimental and not covered by Drupal's security advisory
policy. Evaluate it on a non-production site with a limited test account and non-sensitive data.
See [SECURITY.md](SECURITY.md) for current limits.

With Tool beta12 and Tool Bridge beta4, some validation errors omit the input or property name.
Invalid calls are still rejected. Follow
[Bridge issue #3618734](https://www.drupal.org/project/mcp_server_tool_bridge/issues/3618734)
for the adapter correction.

## Install

Use a current Composer 2 release. From the root of an installed Drupal 11.4 project created from
`drupal/recommended-project`, run:

```bash
composer require \
  'drupal/simple_oauth:^6.1.4' \
  'drupal/tool:^1.0.0-beta12@beta' \
  'drupal/tool_belt:^1.0.0-alpha6@alpha' \
  'drupal/mcp_server:^2.0.0-beta7@beta' \
  'drupal/mcp_server_tool_bridge:^1.0.0-beta4@beta' \
  'drupal/mcp_server_oauth:^1.0.0-alpha2@alpha' \
  'drupal/agent_access:^1.0.0-alpha7@alpha'
```

Composer ignores transitive stability flags, so keep every package in the command. Copy the
package names exactly. For an existing site using the old OAuth package name, follow
[UPGRADING.md](UPGRADING.md). The Simple OAuth minimum also protects installs of existing alpha tags
whose recipe manifests allow older versions. See the [Drupal security advisory](https://www.drupal.org/sa-contrib-2026-296).

Then apply the recipe with Drupal's CLI:

```bash
vendor/bin/dr recipe ../recipes/agent_access
```

With DDEV, prefix `vendor/bin/dr` commands with `ddev exec`, for example
`ddev exec vendor/bin/dr recipe ../recipes/agent_access`.

If Drupal says a newly installed extension "is not a known module or theme," run
`vendor/bin/dr cache:rebuild` and apply the recipe again. Tracked in
[Drupal core issue #3501858](https://www.drupal.org/project/drupal/issues/3501858).

## Connect and try it

The recipe does not generate keys or grant permissions. Finish those by hand, then connect an
agent:

1. Open `/admin/config/people/simple_oauth`, select **Generate keys**, choose a directory outside
   the web root that the web server can write, generate the keys, and save the settings. The form
   fills in the key paths.

   If Drush is already installed, run this from the project root instead:

   ```bash
   mkdir -p /path/outside/webroot/oauth-keys
   vendor/bin/drush simple-oauth:generate-keys /path/outside/webroot/oauth-keys
   vendor/bin/drush config:set simple_oauth.settings public_key /path/outside/webroot/oauth-keys/public.key -y
   vendor/bin/drush config:set simple_oauth.settings private_key /path/outside/webroot/oauth-keys/private.key -y
   ```

2. Applying the recipe with Drupal's CLI without `--url` can save
   `http://localhost/oauth/register` as the registration endpoint. Clear it so Drupal derives the
   endpoint from each request:

   - Project-local Drush:

     ```bash
     vendor/bin/drush config:delete simple_oauth_server_metadata.settings registration_endpoint -y
     vendor/bin/drush cache:rebuild
     ```

   - DDEV:

     ```bash
     ddev drush config:delete simple_oauth_server_metadata.settings registration_endpoint -y
     ddev drush cache:rebuild
     ```

   - Admin UI: open `/admin/config/people/simple_oauth/oauth-21/server-metadata`, clear
     **Client Registration Endpoint**, save, and run `vendor/bin/dr cache:rebuild`.

   Then open `https://your-site.example/.well-known/oauth-authorization-server` and confirm that
   `registration_endpoint` is `https://your-site.example/oauth/register`, not localhost or an old
   hostname. Tracked in
   [Simple OAuth 2.1 issue #21](https://github.com/e0ipso/simple_oauth_21/issues/21).

3. Choose an existing account for testing and give its role two permissions:
   `grant simple_oauth codes` and `access mcp server`. Do not grant them to `authenticated`.

4. In an agent that supports authenticated remote servers and dynamic client registration, add
   this address as a remote MCP server:

   ```text
   https://your-site.example/mcp
   ```

   If the agent cannot register itself, or you need Drupal to require PKCE and disable remembered
   approval, create the OAuth client (a Consumer) by hand as described in
   [CONNECTING.md](CONNECTING.md).

5. The agent should open Drupal in your browser. Sign in with the test account and approve the
   two requested scopes.

6. Confirm that the agent lists exactly these two starter tools:

   - `tool_api__entity_list`: List entities
   - `tool_api__entity_metadata`: Get entity metadata

Then try:

> List up to five Drupal `node` entities I am allowed to access, then show the metadata for the
> first result. Do not make any changes.

See [CONNECTING.md](CONNECTING.md) for client requirements, troubleshooting, and disconnecting.

## What it adds

The recipe enables the Simple OAuth, Tool API, Tool Belt, and MCP Server modules and adds two
scopes mapped to existing Drupal permissions:

| Scope | Existing Drupal permission |
|---|---|
| `drupal:mcp:connect` | `access mcp server` |
| `drupal:content:read` | `access content` |

Both starter tools require both scopes. The protected resource metadata lists them in
`scopes_supported`, so a client that discovers its scopes requests them, and a token without them
gets HTTP 403 with an `insufficient_scope` challenge when it calls a tool.

The two client-visible tools above map to the Tool API IDs `tool_belt:entity_list` and
`tool_belt:entity_metadata`. There are no write tools.

Sites can add compatible tools; review each one's access behavior first. Do not enable
`tool_belt:entity_field_values` or `tool_belt:entity_load_by_id` yet. `entity_list` has known
aggregate and referenced-label access limitations; see [SECURITY.md](SECURITY.md).

## Update a development install

Updating the Composer package does not update the site's active configuration, and `1.0.x-dev`
changes between commits. Back up the site and follow [UPGRADING.md](UPGRADING.md), which includes
the migration recipe for earlier development installs.

## Design drafts

Drafts for a future major release. The `1.0.x` recipe does not yet conform to them:

- [Agent Access contract](CONTRACT.md)
- [Managed personal profile](docs/MANAGED-PERSONAL-PROFILE.md)
- [Interoperability profile](docs/INTEROP-PROFILE.md)
- [Conformance suite](docs/CONFORMANCE.md)

## Report a problem

Report recipe, installation, documentation, and integration problems in the
[Agent Access issue queue](https://www.drupal.org/project/issues/agent_access). For
security-relevant defects, follow [SECURITY.md](SECURITY.md). If the defect is in a dependency,
file it in that module's queue and link it from the Agent Access issue. Remove credentials and
tokens before sharing logs.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).
