# Connect an external agent

The normal connection path starts with one address:

```text
https://your-site.example/mcp
```

Use an HTTPS address that the external agent can reach. A local DDEV address works only when the
client runs on the same machine and trusts its development certificate.

## Before connecting

1. Install and apply the recipe as described in [README.md](README.md).
2. At `/admin/config/people/simple_oauth`, generate keys outside the web root and save the public
   and private key paths, following the exact setup in the README.
3. Follow the README metadata check and confirm that the advertised `registration_endpoint` uses
   the site's reachable HTTPS hostname. Applying the recipe with Drupal's CLI without a site URI
   may otherwise retain localhost.
4. Choose an existing Drupal account for the evaluation. Its role needs:

   - `grant simple_oauth codes`, which lets the person approve a connection;
   - `access mcp server`, which lets approved requests reach the agent endpoint; and
   - the ordinary Drupal permissions needed for the content that person should see.

Do not grant the connection permissions broadly to `authenticated`. This alpha release is
best evaluated with one limited test account on a non-production site.

## Automatic registration: the interoperability path

Use this path when the agent supports authenticated remote servers, OAuth discovery, dynamic
client registration, and authorization code with PKCE.

It minimizes setup, but the current dependency stack does not make PKCE mandatory on the Drupal
Consumer created by dynamic registration. A compatible client can still send an S256 challenge;
Drupal may not reject a client that omits it. Use the manual path below when server-required PKCE,
client-side S256, and an explicit no-remembered-approval setting matter to the test.

1. Add `https://your-site.example/mcp` as the remote connection address in the agent.
2. If the client asks for scopes, request only:

   ```text
   drupal:mcp:connect drupal:content:read
   ```

3. The agent should open the Drupal site in a browser. Sign in with the test account.
4. Review and approve the requested access. The browser should return control to the agent.
5. Inspect the available tools before making a call. A clean install should list exactly:

   - `tool_api__entity_list` — List entities
   - `tool_api__entity_metadata` — Get entity metadata

Try:

> List up to five Drupal `node` entities I am allowed to access, then show the metadata for the
> first result. Do not make any changes.

Use non-sensitive evaluation data. The current `entity_list` provider has known limitations around
aggregate counts and referenced-entity labels; “entities I am allowed
to access” is the intended boundary, not yet a complete non-disclosure guarantee.

These client-visible names map to the Tool API IDs `tool_belt:entity_list` and
`tool_belt:entity_metadata`. The starter catalog has no write tools. Do not enable
`tool_belt:entity_field_values` or `tool_belt:entity_load_by_id` on the current tested stack.

## Controlled setup: create the Consumer manually

Use this path when the client cannot dynamically register itself or when the test needs Drupal to
require PKCE, the client to use S256, and remembered approval to be disabled explicitly.

1. Obtain the client's exact OAuth callback or redirect URI from its documentation or connection
   screen. Do not guess it.
2. In Drupal, open `/admin/config/services/consumer` and add a Consumer. Select the
   **Authorization code** and **Refresh token** grant types, clear **Is Confidential?**, and enter
   that exact redirect URI. The Consumers dependency may create an inert **Default Consumer** on
   first install; leave it unchanged and create a dedicated Consumer for this connection.
3. Under **Authorization Code settings**, select the `drupal:mcp:connect` and
   `drupal:content:read` scopes, leave **Automatic authorization** off, enable **Use PKCE?**, and
   disable **Remember previous approval**. Configure the client to use the S256 challenge method
   and leave **New Secret** empty. The selected scopes are defaults, not an enforced allowlist for
   authorization-code requests, so the client must still request exactly the two scopes named
   here.
4. Give the generated client ID to the agent and configure the connection address as
   `https://your-site.example/mcp`.
5. Request only `drupal:mcp:connect drupal:content:read`, then complete the same browser sign-in and
   approval flow described above.

Never paste a Drupal password, access token, refresh token, authorization code, or private key
into an agent configuration.

## If the connection fails

- **No browser opens:** confirm that the agent supports remote authenticated servers and can reach
  the site's HTTPS address. Also inspect `registration_endpoint` at
  `/.well-known/oauth-authorization-server`; clear a saved localhost or old-host value using the
  README command. Some clients support local MCP processes but not remote connections.
- **The person cannot approve access:** confirm that the account's role has
  `grant simple_oauth codes`.
- **The connection returns 401:** confirm the Simple OAuth key paths, the exact `/mcp` address, and
  the two requested scopes.
- **A tool returns 403 with `insufficient_scope`:** the token lacks `drupal:mcp:connect` or
  `drupal:content:read`. Both starter tools require both scopes; reconnect and request both.
- **A tool returns 403 otherwise:** Drupal is refusing the operation for the connected account.
  Check that account's ordinary Drupal permissions rather than widening the connection role
  globally.
- **The tool list is not exactly the two tools above:** stop and inspect active
  `mcp_tool_config` configuration. An earlier development build may have left retired
  configuration behind; follow [UPGRADING.md](UPGRADING.md).

## Disconnect

Self-service revocation is not complete in the current dependency stack. An administrator must
delete every access-token and refresh-token row for the client and account at
`/admin/config/people/simple_oauth/oauth2_token`. If the Consumer is dedicated to this connection,
remove it at `/admin/config/services/consumer` as well, whether it was created manually or through
dynamic registration. Remove the connection from the agent too.

Do not rely on `/oauth/revoke` for this alpha release. If immediate containment is needed,
block the Drupal account before performing the cleanup above.
