# Security policy

Agent Access for Drupal is experimental and is **not covered by Drupal's security advisory
policy**. Several required modules are prerelease software, and the current connection and
revocation experience still has open general-use gaps. Start with a non-production site, a
limited test account, and data you can safely expose during evaluation. Do not grant connection
permissions broadly.

## Current limits

- Shared-site and multi-account use is not yet a supported security posture for this development
  release.
- Dynamically registered clients in the current stack do not make PKCE mandatory on the created
  Drupal Consumer. A client may still send S256, but use the documented manual Consumer path when
  Drupal must reject a flow without PKCE and remembered approval must be disabled.
- Revocation is currently an administrator operation. Delete the access and refresh tokens for
  the client and account at `/admin/config/people/simple_oauth/oauth2_token`; do not rely on the
  advertised `/oauth/revoke` endpoint for this release.
- Only the two tools shipped in the starter catalog have been selected for this release. Adding a
  compatible tool does not certify that tool's access behavior.
- The current `entity_list` provider has known access-sensitive aggregate-count and
  referenced-label limitations. Use non-sensitive evaluation data;
  do not treat the starter catalog as a complete non-disclosure boundary yet.

## Reporting

- For a security-relevant defect in this recipe's configuration or documentation, contact the
  project maintainer privately through their Drupal.org contact form. Do not publish a working
  exploit or credentials in the project issue queue.
- For a defect in Simple OAuth or another dependency covered by Drupal's security advisory policy,
  follow [Drupal's security-team reporting process](https://www.drupal.org/security-team).
- For a defect in another dependency, check that dependency's Drupal.org security-coverage status
  and contact its maintainers. Do not assume this recipe's policy applies to dependency code.

Before sharing output, remove access and refresh tokens, client identifiers and secrets,
registration responses, passwords, private keys, authorization codes, cookies, and local
filesystem paths.
