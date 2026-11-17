# Update an Agent Access installation

Agent Access `1.0.x` is experimental prerelease software. A later release or `1.0.x-dev` commit may
change dependency versions, starter tools, scopes, or configuration. Test an update away from
production and keep the exact release or commit recorded with any result you report.

Drupal recipes apply configuration; they are not an automated update system. Updating the
Composer package changes the recipe files but does not by itself change the site's active
configuration.

## Before updating

1. Back up the database and exported configuration.
2. Record the installed dependency versions:

   ```bash
   composer show --locked drupal/simple_oauth
   composer show --locked | grep '^drupal/mcp_server_oauth'
   composer show drupal/mcp_server
   composer show mcp/sdk
   ```

   The recipe-unpack Composer plugin removes `drupal/agent_access` from the root requirements and
   installed package records after a successful install, so `composer show drupal/agent_access`
   is not an installed version check. Keep the exact Agent Access commit or release in the site's
   own change record.

3. Read the current README and release notes for changes to the starter catalog or setup.

## Apply the Simple OAuth security update

From the Drupal project root, update Simple OAuth and keep the fixed version as the minimum in
the site’s Composer requirements. This also works for sites that installed Agent Access before
the recipe required 6.1.4. See the [Drupal security advisory](https://www.drupal.org/sa-contrib-2026-296).

```bash
composer require 'drupal/simple_oauth:^6.1.4' --with-dependencies
```

Confirm the resolved version and check the lock for advisories.

```bash
composer show --locked drupal/simple_oauth
composer audit --locked
```

Run the site's usual Drupal database update process. Review existing Consumer settings and grant
**Administer consumer access settings** only to trusted roles. Review existing client credentials
scopes and revoke tokens if in doubt. Test a new connection, refresh, and allowed and denied MCP
calls after updating.

## Update and reapply

If the root `composer.json` still requires `drupal/mcp_server_tool_bridge-mcp_server_tool_bridge`,
remove that old package requirement before the update:

```bash
composer remove drupal/mcp_server_tool_bridge-mcp_server_tool_bridge --no-update
```

If the root `composer.json` requires `drupal/mcp_server_oauth-mcp_server_oauth`, stage its removal
before running the full update below:

```bash
composer remove drupal/mcp_server_oauth-mcp_server_oauth --no-update
```

The full update replaces the qualified package with `drupal/mcp_server_oauth` and refreshes the
recipe together. Keep the Drupal module `mcp_server_oauth` enabled throughout the swap.

Fetch the current recipe and refresh its explicitly installed prerelease dependencies in one
Composer transaction:

```bash
composer require \
  'drupal/simple_oauth:^6.1.4' \
  'drupal/tool:^1.0.0-beta12@beta' \
  'drupal/tool_belt:^1.0.0-alpha6@alpha' \
  'drupal/mcp_server:^2.0.0-beta7@beta' \
  'drupal/mcp_server_tool_bridge:^1.0.0-beta4@beta' \
  'drupal/mcp_server_oauth:^1.0.0-alpha2@alpha' \
  'drupal/agent_access:^1.0.0-alpha7@alpha' \
  --with-dependencies --minimal-changes
```

Do not replace this with `composer update drupal/agent_access`: after recipe unpacking that package
is no longer a root requirement or installed package entry. The `composer require` command
downloads and unpacks the current recipe again while keeping the prerelease stability flags
explicit.

If Composer reports a lock conflict, review the proposed dependency changes before retrying with
`--with-all-dependencies`. That broader option can update shared packages outside this stack.

The `--with-dependencies` option lets Composer refresh the named stack's dependencies without the
broader shared-package updates requested by `--with-all-dependencies`. Check the resolved versions
and advisory state:

```bash
composer show drupal/mcp_server
composer show mcp/sdk
composer audit --locked
```

The dependency minimums are Simple OAuth `6.1.4`, Tool `1.0.0-beta12`, Tool Belt `1.0.0-alpha6`,
MCP Server `2.0.0-beta7`, Tool Bridge `1.0.0-beta4`, and MCP Server OAuth `1.0.0-alpha2`.
Check that only the short MCP Server OAuth package appears in the site lock file.

Run Drupal database updates through the site's usual update process, for example
`vendor/bin/drush updatedb -y`, and rebuild caches before applying the recipe again. Tool beta12 includes updates.
See the README for the known Tool beta12 / Bridge beta4 validation-message limitation.

If the original Drupal CLI recipe apply omitted `--url` and saved localhost or an old hostname as
the OAuth client registration endpoint, restore request-time discovery. If project-local Drush is
installed, run:

```bash
vendor/bin/drush config:delete simple_oauth_server_metadata.settings registration_endpoint -y
vendor/bin/drush cache:rebuild
```

With DDEV, run `ddev drush config:delete simple_oauth_server_metadata.settings
registration_endpoint -y` followed by `ddev drush cache:rebuild`.

Without project-local Drush or DDEV, open
`/admin/config/people/simple_oauth/oauth-21/server-metadata`, clear **Client Registration
Endpoint**, save the form, and run `vendor/bin/dr cache:rebuild`.

If this site already applied an earlier Agent Access release or `1.0.x-dev` revision, run the
bundled development migration recipe first. Strict reapplication otherwise stops on the starter
tool configs, which now carry OAuth scope settings:

```bash
vendor/bin/dr recipe ../recipes/agent_access/updates/1.0.x-dev
```

Then apply the updated main recipe:

```bash
vendor/bin/dr recipe ../recipes/agent_access
```

With DDEV, prefix each recipe command with `ddev exec`. Fresh installs do not run the migration
recipe; they apply only the main recipe.

The migration recipe sets the `mcp_server_oauth` authentication mode and scopes on the two
retained tool configs, keeping their other third-party settings, then disables the retired
`entity_field_values` tool shipped by the earlier public development revision. The disabled
configuration object may be deleted later, but manual deletion is not required to keep it out of
the exposed tool catalog.

Rebuild caches after applying the recipes, for example `vendor/bin/drush cache:rebuild`. Drupal's
page cache can otherwise keep serving protected resource metadata without the new
`scopes_supported`.

If reapplication reports a conflict in other recipe-owned configuration, do not delete active
configuration blindly. Compare it with the updated recipe, restore the backup if necessary, and
report the conflict with secrets removed.

## Verify the result

1. Confirm that `/.well-known/oauth-authorization-server` advertises the site's reachable HTTPS
   `/oauth/register` URL. Confirm that `/.well-known/oauth-protected-resource/mcp` identifies
   the site's full `/mcp` URL as its resource.
2. Confirm that `/.well-known/oauth-protected-resource/mcp` lists `drupal:mcp:connect` and
   `drupal:content:read` in `scopes_supported`.
3. Reconnect the external agent if the catalog or requested scopes changed.
4. Confirm that `tools/list` contains exactly the two client-visible starter tools:

   - `tool_api__entity_list`
   - `tool_api__entity_metadata`

5. Make a read call with the intended test account and confirm that a less-privileged account is
   still denied content it cannot access in Drupal.

For a development environment with substantial drift, rebuilding a fresh site and applying the
current recipe may be clearer than trying to preserve experimental configuration.
