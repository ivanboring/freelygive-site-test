# Drupal Agent Access conformance

> **Status:** Proposed
>
> **Suite version:** `0.1.0-draft`
>
> **Contract:** [`CONTRACT.md`](../CONTRACT.md), proposed `0.1.0-draft`
>
> **Managed profile:** [`MANAGED-PERSONAL-PROFILE.md`](MANAGED-PERSONAL-PROFILE.md),
> proposed `0.1.0-draft`
>
> **Interoperability profile:** [`INTEROP-PROFILE.md`](INTEROP-PROFILE.md),
> proposed `0.1.0-draft`

## Purpose

This document defines the evidence needed to claim that an implementation,
named connection profile, or optional capability profile behaves as the Drupal
Agent Access contract requires.

It separates three claims:

1. **Base contract conformance** proves the account-bound OAuth authority
   boundary without requiring a capability provider.
2. **Managed-personal profile conformance** adds external-person binding,
   durable connection lifecycle, continuity, deployment binding, and managed
   administration.
3. **Capability-profile qualification** proves the access and behavior of one
   exact provider, version, and advertised profile. It does not certify the
   connection foundation.

Passing prose review, installing a package, or receiving a plausible agent
answer is not conformance evidence.

## Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**,
and **MAY** are to be interpreted as described in
[BCP 14](https://www.rfc-editor.org/info/bcp14) (RFC 2119 and RFC 8174) when,
and only when, they appear
in all capitals, as shown here.

Scenario IDs are stable. Reordering or clarifying a scenario does not change
its ID. A changed expected behavior requires a new scenario ID and suite
version.

## Claim rules

An implementation may make only the claims whose applicable scenarios pass:

| Claim | Required scenarios |
|---|---|
| `contract-conformant` | Every `BASE-*` scenario |
| `profile-conformant:managed-personal` | Every `BASE-*` and every applicable `MANAGED-*` scenario |
| `provider-qualified:<profile-id>` | All applicable `CAP-*` cases for one provider build |

These identifiers are canonical. A report MUST NOT substitute an unversioned
alias such as `profile-conformant`, `interop-profile-conformant`, or
`managed-profile-conformant`.

A named managed profile MUST publish its feature declaration before testing. A
scenario may be `not-applicable` only when the normative profile explicitly
makes the corresponding behavior optional and the published declaration omits
it.

For `profile-conformant:managed-personal` against
`MANAGED-PERSONAL-PROFILE.md` `0.1.0-draft`, the only conditional scenarios
are:

- `MANAGED-011`, when the OAuth framework uses a plumbing marker;
- `MANAGED-022`, when at least one optional capability provider is enabled;
- `MANAGED-023`, when the implementation supports credential recovery;
- `MANAGED-030`, when the implementation supports credential recovery;
- `MANAGED-031`, when the implementation supports application-mutation
  recovery;
- `MANAGED-033`, when the implementation exposes pending state; and
- `MANAGED-053`, when the profile selects an inactivity policy.

Every other `MANAGED-*` scenario is required. A failed, skipped, indeterminate,
unsupported, or improperly excluded applicable scenario blocks the claim.

Until the proposed managed personal profile and its required interfaces are
published and an implementation passes every applicable case, scenario results
are supporting evidence rather than a final profile-conformance claim.

Any unauthorized disclosure, authority elevation, cross-account use,
cross-client use, duplicate mutation, or resurrection of retired authority is
an immediate failure. An aggregate score cannot override it.

## Deterministic test fixture

The suite MUST run against a controlled Drupal fixture with synthetic data. It
MUST NOT depend on a maintainer's workstation paths, personal identifiers,
production accounts, customer data, or reusable credentials.

At minimum, the fixture provides:

- two loadable Drupal accounts with intentionally different authority;
- user 1 under both enabled and disabled Drupal superuser-policy configurations;
- one blocked account and one deleted-account case;
- two registered OAuth clients plus one unrelated client used to test
  isolation;
- one public item, one item accessible only to the broader account, and one
  item inaccessible to both test accounts;
- one protected field or relationship and one validation constraint;
- revisions and a workflow or equivalent state transition when the tested
  provider advertises mutation or workflow behavior;
- a clean state with no optional capability provider enabled;
- an optional provider-enabled state for provider and transport checks;
- two synthetic external-person identifiers for managed-profile cases; and
- an original deployment plus an independently identifiable copied or restored
  deployment when deployment binding is selected.

Tests MUST NOT use user 1 as proof of least privilege. Identifiers such as
`account_a`, `account_b`, `client_a`, `client_b`, `person_a`, and `person_b`
SHOULD be used in retained evidence.

Each scenario starts from a declared clean fixture snapshot unless the
scenario explicitly names an ordered predecessor. The run manifest records the
fixture version, configuration fingerprint, clock assumptions, and every
failure-injection point. Re-running the same scenario against the same fixture
and versions MUST produce the same verdict.

## Base contract conformance

The base suite proves the small Drupal-side authority contract. It does not
require MCP, JSON:API, Tool API, an embedded interface, or any other optional
capability provider.

### Foundation without a provider

#### BASE-001: Zero-provider foundation

- **Setup:** Install the candidate foundation with every optional capability
  provider disabled or absent.
- **Action:** Establish an account-bound OAuth delegation, resolve the
  connected account and client, inspect the site's connection surface, and
  revoke the delegation.
- **Required result:** Establishment, resolution, inventory or discovery, and
  revocation work without enabling a rich provider. No provider route is
  silently enabled.
- **Evidence:** Extension and configuration inventory, OAuth result with secret
  material redacted, resolved synthetic account and client identifiers,
  discovery result, revoke result, and denied post-revoke request.

#### BASE-002: Inventory contains no bearer credential

- **Setup:** Multiple exact account-client delegations exist in the zero-provider
  fixture.
- **Action:** Inspect person and authorized-administrator inventory and
  discovery surfaces.
- **Required result:** A person can identify and revoke their own delegations.
  An administrator can enumerate every delegation they may manage with enough
  account, registered-client, profile, and lifecycle state to distinguish and
  revoke one exact delegation. No surface returns access tokens, refresh tokens,
  authorization codes, client secrets, private keys, or equivalent reusable
  credentials.
- **Evidence:** Per-person and administrator results, exact revoke target,
  unaffected-delegation checks, and an automated forbidden-field and
  credential-pattern check.

#### BASE-003: Drupal policy controls establishment and use

- **Setup:** The site defines eligible and ineligible accounts, two registered
  clients, and an enabled Agent Access foundation.
- **Action:** Attempt establishment for each account and client, remove one
  active account's eligibility, then disable Agent Access site-wide.
- **Required result:** Only Drupal-eligible account-client combinations can
  establish a delegation. Eligibility loss denies the next protected request.
  Site-wide disablement prevents establishment and denies every Agent Access
  delegation without changing unrelated OAuth clients or Drupal permissions.
  Restoration does not silently reactivate a delegation Drupal retired.
- **Evidence:** Drupal policy state, establishment outcomes, post-change request
  results, active-delegation inventory, and unrelated-client checks.

### Exact principal and client

#### BASE-010: Resolve the exact account and client

- **Setup:** `account_a` and `account_b` each authorize `client_a` separately.
- **Action:** Send the same protected request through each delegation.
- **Required result:** Each request resolves its own exact Drupal account and
  `client_a`. Account-specific results differ where the fixture authority
  differs, with no state bleed.
- **Evidence:** Request outcomes, runtime principal/client observations, and
  independent Drupal readback.

#### BASE-011: Missing Drupal account fails closed

- **Setup:** Create a valid delegation, then delete its bound Drupal account.
- **Action:** Send a protected request with surviving credential material.
- **Required result:** The request is denied before application behavior. No
  default, anonymous, system, shared, or different account is substituted.
- **Evidence:** Account-deletion readback, denial category, and proof that no
  protected read or mutation occurred.

#### BASE-012: Missing or disabled client fails closed

- **Setup:** Create a valid delegation, then disable and separately delete its
  registered client in isolated runs.
- **Action:** Send a protected request with surviving credential material.
- **Required result:** Both requests are denied before application behavior.
  Restoring a client does not silently reactivate a delegation Drupal retired.
- **Evidence:** Client-state readback, request outcomes, and connection-state
  readback.

#### BASE-013: Caller-supplied identity is not binding evidence

- **Setup:** Authorize `account_a` through `client_a`.
- **Action:** Add caller-controlled account, client, external-person, role, or
  organization fields that name `account_b` or `client_b`.
- **Required result:** The implementation ignores the claims for authority or
  denies the request. It never resolves the caller-supplied identity as the
  acting account or client.
- **Evidence:** Exact request fields, resolved account/client observations, and
  outcome.

#### BASE-014: Legacy and fallback paths remain unavailable

- **Setup:** The candidate has a valid Agent Access delegation and the fixture
  contains no authorized legacy or shared-agent route.
- **Action:** Present missing, invalid, or mismatched request context and probe
  any previously supported fallback named by the implementation's migration
  record.
- **Required result:** The request fails closed. It does not fall back to a
  registered-client default, anonymous or system account, shared agent account,
  different account, or legacy bearer path.
- **Evidence:** Denial results and route or authentication-provider inventory.

#### BASE-015: Unrestricted account authority is explicit

- **Setup:** Run isolated cases for user 1 with Drupal's superuser access policy
  enabled and disabled. Site policy can allow and prohibit its delegation.
- **Action:** Attempt establishment, inspect authorized inventory, and invoke a
  request unavailable to an ordinary account.
- **Required result:** Agent Access never infers unrestricted authority from the
  account identifier. When Drupal's enabled policy supplies unrestricted
  authority and the site permits the delegation, inventory identifies it as
  unrestricted. Site policy can prohibit it. With the policy disabled, Agent
  Access supplies no independent all-access behavior.
- **Evidence:** Drupal parameter and access-policy state, site eligibility,
  establishment outcome, inventory result, and protected-request readback.

### Current Drupal authority and non-elevation

#### BASE-020: Offered operation cannot add authority

- **Setup:** A grant, catalog, profile, or test provider offers an operation
  that `account_a` is not allowed to perform but `account_b` may perform.
- **Action:** Invoke it as each account.
- **Required result:** `account_a` is denied and no state changes. `account_b`
  succeeds only if every other applicable Drupal access and validation check
  passes. Offering the operation creates no Drupal role, permission, or grant.
- **Evidence:** Before-and-after role and permission state, both request
  outcomes, and independent state readback.

#### BASE-021: Current access change applies on the next request

- **Setup:** `account_a` can perform one protected operation through an active
  delegation.
- **Action:** Remove the applicable Drupal authority without replacing the
  delegation, repeat the request, restore only that authority, and repeat it
  again.
- **Required result:** The first repeat is denied. Restoration permits only the
  restored check to pass and does not bypass other contextual, entity, field,
  workflow, or validation decisions. No reconnection is required for the
  ordinary authority change.
- **Evidence:** Authority changes, three request outcomes, stable delegation
  identity, and state readback.

#### BASE-022: Exact access and validation checks still run

- **Setup:** Create separate denial conditions for route, entity, protected
  field, validation, and workflow access supported by the fixture.
- **Action:** Invoke the corresponding protected requests through an otherwise
  valid delegation.
- **Required result:** Each applicable Drupal check is enforced. A permission
  pass does not suppress a later entity, field, validation, workflow,
  node-access, revision, translation, or custom-access denial.
- **Evidence:** One retained result per applicable check and proof of unchanged
  state after every denied mutation.

#### BASE-023: Deferred execution preserves delegated authority

- **Setup:** A test operation queues or batches a protected Drupal read or
  mutation under an active delegation.
- **Action:** Execute once while authority remains valid, then in isolated runs
  revoke the delegation, remove eligibility, block the account, disable the
  client or site, and change operation-specific authority before the worker
  executes.
- **Required result:** Deferred state contains no bearer credential or serialized
  authority. Each execution re-resolves the exact delegation, account, and
  client and re-runs then-current authorization and validation. The ambient
  cron, queue, anonymous, system, or worker account is never substituted, and
  every authority-ending or operation-denial case fails closed.
- **Evidence:** Redacted deferred-state shape, worker principal/client
  observations, ordered policy changes, outcomes, and independent Drupal
  readback.
- **Applicability:** Required when the implementation accepts an Agent Access
  request that schedules protected Drupal behavior; otherwise explicitly
  `not-applicable`.

### Revocation and lifecycle isolation

#### BASE-030: Person revocation is effective on the next request

- **Setup:** A person has an active delegation and can make a protected
  request.
- **Action:** Revoke it through the supported person-authorized path, then send
  the next protected request with previously valid credential material.
- **Required result:** The next request is denied and the credential cannot
  restore the delegation.
- **Evidence:** Successful pre-revoke request, revoke result, connection-state
  readback, and denied post-revoke request.

#### BASE-031: Administrator revocation is exact

- **Setup:** `account_a` and `account_b` each have active delegations through
  `client_a`.
- **Action:** An authorized site administrator revokes only `account_a`'s exact
  delegation.
- **Required result:** `account_a` is denied on the next request.
  `account_b` remains active, and no unrelated client or delegation changes.
- **Evidence:** Before-and-after inventory and one post-revoke request per
  account.

#### BASE-032: Account block is effective on the next request

- **Setup:** An active delegation exists for `account_a`.
- **Action:** Block the account and send the next protected request.
- **Required result:** The request is denied before application behavior. A
  surviving token cannot keep the blocked account active.
- **Evidence:** Account-state readback, denial result, and unchanged protected
  state.

#### BASE-033: Client-specific lifecycle is isolated

- **Setup:** `account_a` authorizes both `client_a` and `client_b`; an unrelated
  account also authorizes one client.
- **Action:** Revoke, disable, recover, or rotate state for one exact client and
  delegation.
- **Required result:** Only that exact client/delegation changes. The other
  client and unrelated account keep their prior authority and lifecycle.
- **Evidence:** Before-and-after inventory and a protected request through each
  unaffected delegation.

### Attribution

#### BASE-040: Operation-actor and client provenance are distinct

- **Setup:** A deterministic test-only fixture operation records operation-actor
  or revision-creator attribution and exposes registered-client provenance. The
  fixture operation is conformance instrumentation, not a shipped capability
  provider.
- **Action:** Perform the operation as `account_a` through `client_a`, then as
  the same account through `client_b`.
- **Required result:** Drupal's operation-actor or revision-creator attribution
  remains `account_a` in both cases. Any declared content-author reassignment
  follows current Drupal authorization and remains distinct from acting-account
  and client provenance. The separately recorded client differs. Neither client
  record is described as proof of a particular model, agent instance, or human
  request origin.
- **Evidence:** Drupal entity or revision readback, provenance record, and the
  implementation's assurance statement.

#### BASE-041: Drupal emits site-controlled lifecycle and mutation provenance

- **Setup:** A test delegation is established, used for one attempted mutation,
  denied for another, and revoked.
- **Action:** Inspect the Drupal-side provenance event surface or a
  site-controlled configured sink.
- **Required result:** Each lifecycle event and attempted mutation exposes a
  safe correlation reference, acting account, registered client, action or
  target, and normalized outcome. The site can retrieve the evidence without
  depending solely on the external client. No event contains a bearer
  credential or protected payload. Drupal's operation-actor or
  revision-creator attribution remains the connected account.
- **Evidence:** Sanitized event records, sink ownership/configuration, entity or
  revision readback, and forbidden-value assertions.

### Transport independence

#### BASE-050: Enabled providers reuse the authority boundary

- **Setup:** Enable one or more providers supported by the candidate. If two
  transports implement the same test operation, enable both.
- **Action:** Invoke equivalent protected behavior through each enabled
  provider using the same delegation.
- **Required result:** Every provider resolves the same account and client and
  applies current Drupal authority. Enabling a provider does not create another
  delegation or consent ceremony. A second transport is tested when one is
  available, but is not required for base conformance.
- **Evidence:** Provider inventory, delegation identity, resolved
  account/client observations, outcomes, and state readback.
- **Applicability:** Required when the candidate distributes, enables, or
  claims support for at least one capability provider. Otherwise record
  `not-applicable`; `BASE-001` remains the required transport-free case.

#### BASE-051: Provider loss does not change connection authority

- **Setup:** An active delegation and enabled provider are healthy.
- **Action:** Disable or make that provider unavailable, then inspect the
  connection and attempt the provider behavior.
- **Required result:** The capability is unavailable with a distinguishable
  outcome. The delegation is not silently revoked, and the implementation does
  not enable or fall back to a legacy, shared, broader, semantically different,
  or unreviewed route.
- **Evidence:** Connection state, provider state, failure category, route
  inventory, and proof of no protected state change.
- **Applicability:** Required when the candidate distributes, enables, or
  claims support for at least one capability provider. Otherwise record
  `not-applicable`.

### Failure semantics

#### BASE-060: Safe failure classes remain distinguishable

- **Setup:** Prepare absent or revoked delegation, site-disabled or ineligible
  account, Drupal authorization denial, Drupal validation failure, and, when
  supported, provider-unavailable, transport-failure, and uncertain-mutation
  cases.
- **Action:** Trigger each case independently and inspect person-facing,
  authorized-administration, support, and evidence surfaces.
- **Required result:** Sensitive person-facing detail may be coarsened, but
  authorized surfaces preserve the safe reason class and correlation reference.
  A provider, transport, or replaceable-credential failure is not reported as
  authoritative revocation or a required reconnection.
- **Evidence:** One sanitized result and correlated diagnostic record per
  applicable class.

## Managed-personal profile conformance

The `MANAGED-*` scenarios apply in addition to the base suite. They test a
named profile's declared managed features without turning those features into
requirements for independent OAuth clients.

### Current sender and target binding

#### MANAGED-001: Current external person is re-established for every use

- **Setup:** `person_a` and `person_b` have separate managed connections. Give
  both authenticated subjects the same synthetic email in one isolated case,
  and change `person_a`'s email and organization metadata without changing its
  external issuer and subject in another.
- **Action:** Each person sends a request before and after those metadata
  conditions, then `person_b` presents a conversation, project, workspace,
  organization, or opaque connection reference created by `person_a`.
- **Required result:** Each normal request uses its current authenticated
  person's exact connection. The borrowed reference grants no access and does
  not transfer or broaden `person_a`'s connection.
- **Evidence:** Authenticated synthetic issuer and subject, mutable identity
  metadata, selected connection ID, resolved Drupal account/client, target,
  and request outcome.

#### MANAGED-002: Exact target mismatch fails closed

- **Setup:** One person has managed connections to two sites or deployments.
- **Action:** Present the credential or connection reference for one target to
  the other.
- **Required result:** The request is denied before provider behavior. A
  matching human-readable environment label does not make the target valid.
- **Evidence:** Target identities, request outcome, and proof that neither
  target's protected state changed.

#### MANAGED-003: Establishment binds both authenticated identities

- **Setup:** `person_a` has an active external authentication session and
  controls existing `account_a`. A second account, person, nonexistent Drupal
  account reference, expired attempt, and consumed attempt are available as
  negative fixtures. Record Drupal's account inventory before testing.
- **Action:** Complete establishment for the exact target tuple, inspect the
  confirmation shown before activation, then attempt replay, each mismatched
  identity case, and establishment against the nonexistent account reference.
- **Required result:** Activation requires contemporaneous authenticated
  evidence for both `person_a` and `account_a`, bound to the exact client,
  site, deployment, and attempt. Confirmation unambiguously identifies that
  tuple. Email matching, caller-supplied identifiers, expired evidence, and
  replay cannot establish or replace a connection. A missing Drupal account
  fails closed and is not created by the connection flow.
- **Evidence:** Redacted authentication-boundary observations, confirmation
  fields, attempt identifiers, activation result, negative outcomes,
  authoritative connection inventory, and unchanged before-and-after Drupal
  account inventory for the missing-account case.

#### MANAGED-004: Unrestricted authority is identified or prohibited

- **Setup:** Configure Drupal's active access policy so `account_a` has
  unrestricted authority. The managed profile publishes whether that condition
  is permitted or prohibited.
- **Action:** Attempt establishment. If permitted, inspect the person's
  pre-activation confirmation and the authorized administrator surface.
- **Required result:** A permitted connection is identified as unrestricted in
  both the person confirmation and authorized administration. A profile that
  prohibits unrestricted connections refuses activation without weakening
  Drupal's policy or presenting the connection as limited.
- **Evidence:** Active Drupal access-policy state, published profile policy,
  establishment result, and sanitized person and administrator surface
  captures or schemas.

### Managed client and connection establishment

#### MANAGED-010: Managed establishment does not depend on DCR

- **Setup:** Start from the exact candidate's clean installation and published
  managed-profile defaults before any post-install registration configuration.
- **Action:** Inspect the default Dynamic Client Registration state, then
  intentionally provision or enroll the managed client through the profile's
  trusted path and establish a connection.
- **Required result:** Dynamic Client Registration is absent or disabled by
  default. The connection succeeds without enabling it, resolves the enrolled
  client, and does not enable registration for independent clients.
- **Evidence:** Clean-install identity and configuration inventory, observed
  default DCR state, enrollment result, and connection result.

#### MANAGED-011: Framework marker is not customer authority

- **Setup:** The profile uses an OAuth scope or marker solely to satisfy
  framework plumbing.
- **Action:** Inspect administrator and person surfaces, change optional
  provider availability, and make both an authorized and denied request.
- **Required result:** The marker is fixed by the profile, cannot be selected by
  the customer as a capability permission, and neither grants nor predicts
  Drupal authority. Provider changes require no marker-specific consent.
- **Evidence:** Profile configuration, UI or API inventory, delegation state,
  and both request outcomes.
- **Applicability:** Profile-activated only when such a marker exists.

#### MANAGED-012: Caller fields cannot bind the external person

- **Setup:** The profile binds an external person identity during managed
  establishment.
- **Action:** Submit a valid Drupal-side attempt with caller-controlled email,
  subject, account, site, deployment, client, or organization fields that name
  another person or target, but without the profile's authenticated binding
  evidence.
- **Required result:** The connection is not established or replaced. No
  caller-controlled field becomes principal evidence.
- **Evidence:** Redacted attempt fields, validation outcome, and unchanged
  connection inventory.

#### MANAGED-013: Credential custody is encrypted and tuple-bound

- **Setup:** Establish two synthetic target tuples using distinguishable
  credential canaries whose plaintext is never retained as evidence.
- **Action:** Persist and use each credential, inspect storage and key metadata,
  scan model input, prompts, conversation and browser state, logs, traces,
  analytics, support exports, and provider configuration for the canary, then
  attempt to use one tuple's custody handle for the other.
- **Required result:** Reusable credentials are ciphertext at rest under the
  profile's approved managed key system. Plaintext appears only inside the
  isolated use boundary, appears in none of the forbidden sinks, and cannot be
  leased or used for another tuple. Credential access remains auditable without
  recording the credential.
- **Evidence:** Named custody/key configuration, ciphertext and safe canary
  digests, forbidden-sink scan results, cross-tuple denial, and sanitized audit
  events.

#### MANAGED-014: Activation waits for both authoritative commits

- **Setup:** Establish a connection with controlled failure points before
  custody acceptance, before Drupal commits the delegation active, and after
  both have committed.
- **Action:** At each point, inspect connection inventory, bounded context, and
  every enabled application or provider route.
- **Required result:** No application data or capability is available until the
  managed platform has durably accepted encrypted custody and Drupal has
  committed the exact delegation active. The connection becomes visibly active
  only after authoritative readback confirms both outcomes.
- **Evidence:** Ordered commit/readback observations, inventory and route
  results at each failure point, and proof of no protected read or mutation
  before activation.

#### MANAGED-015: One full delegation has no parallel permission picker

- **Setup:** Establish one managed personal connection and inspect its person,
  administrator, delegation, and provider-management surfaces.
- **Action:** Exercise both an allowed and denied Drupal operation, then enable
  and disable every supported optional provider.
- **Required result:** The logical connection has exactly one full
  account-bound delegation. No customer scope picker, parallel permission list,
  per-provider grant, or per-capability OAuth consent is present. Provider
  changes neither create another delegation nor change the grant, while current
  Drupal authorization still independently allows or denies each operation.
- **Evidence:** Delegation inventory and count, sanitized person and
  administrator surface captures or schemas, provider lifecycle results, and
  allowed and denied Drupal outcomes.

#### MANAGED-016: Registration and selected client assurance are exact

- **Setup:** Publish the managed client's client type, supported grant
  behavior, assurance profile, and exact approved redirect URI set. For any
  non-public assurance choice, retain the deployment-specific review that
  approved it. When the selected profile is public-client authorization code,
  configure S256 PKCE, confirm that the client generates fresh PKCE material
  for each attempt, and prepare missing, plain, and incorrect verifier cases
  plus replay of a consumed authorization code.
- **Action:** Attempt authorization with an exact approved and altered redirect
  URI, the declared grant and an undeclared or downgraded grant, and each
  assurance-negative case, then complete the valid flow.
- **Required result:** Only the declared client type, supported grant behavior,
  exact approved redirect, and selected client assurance succeed. A
  public-client profile rejects missing, downgraded, and incorrect PKCE
  evidence, and a consumed authorization code cannot be replayed. The
  successful delegation resolves the exact intended account and client.
- **Evidence:** Published client type, grant behavior, assurance profile,
  approved redirect set, sanitized authorization outcomes, deployment review
  for a non-public choice when applicable, client PKCE-generation observation,
  PKCE method and negative results when applicable, and resolved account/client
  observations.

#### MANAGED-017: Supported dependency upgrade preserves the profile

- **Setup:** Establish a managed connection and an unrelated independent client
  on one exact supported dependency combination, then select another
  combination that the published compatibility policy classifies as either a
  supported upgrade or explicitly incompatible.
- **Action:** Attempt the published transition. For a supported upgrade,
  exercise establishment, protected use, declared recovery behavior when
  supported, revocation, inventory, and the unrelated client.
- **Required result:** A supported upgrade preserves the profile's authority,
  binding, custody, lifecycle, and isolation semantics. It does not broaden a
  grant, rebind an account or client, resurrect retired authority, or alter the
  unrelated client. A transition declared incompatible is rejected visibly and
  does not continue under untested semantics or change either connection.
- **Evidence:** Exact before-and-after dependency and profile versions, upgrade
  policy and result, configuration and connection inventory, protected request
  outcomes when supported, and unrelated-client checks.

### Durable lifecycle and continuity

#### MANAGED-020: Credential rejection is not revocation

- **Setup:** An active managed connection has a credential that can be rejected
  without ending Drupal's authoritative connection state.
- **Action:** Cause the access credential to be rejected before its expected
  expiry and inspect connection state. If the implementation declares
  credential recovery, invoke it. If it also declares automatic request retry,
  exercise one request known not to have executed and one with an uncertain
  outcome.
- **Required result:** The profile reports credential maintenance or an
  actionable credential failure, not revocation, and does not require a new
  person connection ceremony solely because of the rejection. Declared
  recovery, when present, is bounded and may restore use. Declared automatic
  retry occurs at most once and only for the request known not to have executed;
  the uncertain request is not retried.
- **Evidence:** Authoritative connection state, rejected request, declared
  recovery outcome when applicable, retry counts and execution-certainty
  observations when applicable, and final request results.

#### MANAGED-021: Ordinary continuity events do not end the connection

- **Setup:** An active managed connection can complete a protected request.
- **Action:** In isolated runs, end the ordinary Drupal browser session, save
  the Drupal account without changing authority, rotate recoverable
  credentials, and interrupt the network transiently.
- **Required result:** None of those events alone retires the connection or
  requires a new person ceremony. Current Drupal authority still controls the
  next successful request.
- **Evidence:** Stable connection identity and state across each event, plus a
  successful or correctly denied post-event request.

#### MANAGED-022: Provider outage degrades only the provider

- **Setup:** An active managed connection has one healthy optional provider and,
  when supported, a second healthy provider.
- **Action:** Disable or fail that provider.
- **Required result:** Managed connection state and other foundation behavior
  remain available. The provider is reported separately as unavailable, and no
  reauthorization or unsafe fallback occurs. Credential custody and Drupal
  authority do not change. When a second provider exists, its health and
  availability remain unchanged.
- **Evidence:** Connection and provider state before and after the failure,
  custody-generation and authority observations, second-provider state when
  applicable, bounded foundation response when selected by the profile, and
  failure category.
- **Applicability:** Profile-activated when at least one optional capability
  provider is enabled.

#### MANAGED-023: Authority-ending state wins over credential recovery

- **Setup:** Recovery is possible for an active managed connection.
- **Action:** Start or queue recovery while Drupal revokes the connection,
  removes profile eligibility, blocks or deletes the account, disables or
  deletes the client or integration, changes the binding, or retires the
  lineage. Test each event supported by the named profile.
- **Required result:** No surviving or newly returned credential restores the
  ended authority. The connection reaches the profile's authoritative ended or
  actionable state.
- **Evidence:** Ordered event record, recovery outcome, authoritative Drupal
  state, and denied final request.
- **Applicability:** Profile-activated when the implementation supports
  credential recovery.

#### MANAGED-024: Restoring a prerequisite does not revive retired authority

- **Setup:** Establish an active connection and retain a still-valid synthetic
  credential. Prepare isolated cases for account block, eligibility removal,
  managed-client disablement, incompatible profile state, site-wide
  integration disablement, and any profile-defined security retirement.
- **Action:** Trigger each applicable authority-ending state, verify denial,
  restore the account, eligibility, client, compatible profile state,
  integration, or security prerequisite when restoration is meaningful, and
  present the surviving credential before invoking any explicit profile
  reactivation or new-connection process.
- **Required result:** Each authority-ending event retires the connection.
  Restoring the prerequisite does not reactivate it, and the surviving
  credential remains denied. Authority can return only through the profile's
  explicit process, without changing an unrelated connection.
- **Evidence:** Ordered lifecycle state, denied requests before and after
  prerequisite restoration, credential-generation-safe identifier, explicit
  reactivation or new-connection result, and unrelated-connection checks.

### Concurrent and uncertain outcomes

#### MANAGED-030: Concurrent recovery cannot overwrite newer state

- **Setup:** Two callers encounter the same rejected credential generation for
  one active connection. A distinguishable account/client delegation is
  available as a cross-binding negative, and one operation is denied by the
  original delegation's current Drupal authority.
- **Action:** Allow both recovery paths to proceed through controlled
  concurrency.
- **Required result:** The callers perform at most one refresh for the rejected
  generation; later work reuses the newer generation. The returned credential
  pair is promoted atomically and remains bound to the original account,
  client, delegation, and grant ceiling. It cannot select the cross-binding
  fixture or perform the operation denied to the original delegation. Stale
  work does not overwrite newer state, end the connection, or cause an
  unbounded refresh loop.
- **Evidence:** Correlated recovery timeline, refresh count, generation-safe
  identifiers, atomic credential-store observations with secrets omitted,
  resolved account/client/delegation after refresh, allowed and denied request
  results, and the unchanged cross-binding fixture.
- **Applicability:** Profile-activated when the implementation supports
  credential recovery.

#### MANAGED-031: Uncertain mutation is never duplicated

- **Setup:** A managed request performs a deterministic test mutation.
- **Action:** Lose or interrupt the response after the request may have
  executed, then invoke the profile's recovery behavior.
- **Required result:** The implementation does not blindly repeat the mutation.
  It resolves the outcome or reports it as uncertain according to the named
  profile, with at most the intended single state change.
- **Evidence:** Request correlation, failure injection, profile outcome, and
  independent Drupal readback including revision or operation count.
- **Applicability:** Profile-activated when the implementation supports
  application-mutation recovery.

#### MANAGED-032: Replacement preserves prior authority until commit

- **Setup:** A working managed connection is being replaced.
- **Action:** Inject failure before Drupal commits replacement, after Drupal
  commits but before the caller receives the result, and during subsequent
  reconciliation.
- **Required result:** Before commit, the prior connection remains active.
  After commit, the exact new connection is authoritative and the named prior
  connection is retired. A lost response is reconciled from authoritative state
  rather than guessed from transport failure.
- **Evidence:** Failure-point record, connection inventory after each run,
  immutable or replayable outcome when selected by the profile, and requests
  through old and new state.

#### MANAGED-033: Pending state cannot reach application behavior

- **Setup:** The named profile uses pending activation.
- **Action:** Present pending credential state to foundation context, optional
  providers, reads, and mutations, then invoke only the exact lifecycle control
  allowed by the profile.
- **Required result:** Every application behavior is denied. Only the narrowly
  scoped lifecycle control may proceed, and it cannot return application data
  or perform an application mutation.
- **Evidence:** One result per route class, lifecycle-control result, and proof
  of unchanged application state.
- **Applicability:** Profile-activated when pending activation is supported.

#### MANAGED-034: Uncertain lifecycle outcomes reconcile authoritatively

- **Setup:** Prepare activation and revocation operations whose responses can be
  lost after Drupal may have committed, plus one unrelated active connection.
  Prepare abandonment too when the implementation exposes that operation.
- **Action:** Interrupt each operation at the uncertain point, repeat resolution
  with the same exact operation identity, and attempt conflicting lifecycle
  work before resolution completes.
- **Required result:** The implementation reads Drupal's authoritative outcome
  rather than inferring it from transport status. Repeated resolution returns
  the same committed result or an authoritative result that the operation did
  not commit. Conflicting work remains blocked, no second mapping or retired
  authority is activated, and the unrelated connection is unchanged.
- **Evidence:** Correlated operation and failure-point timeline, repeated
  resolution results, before-and-after connection inventories, abandonment
  result when supported, conflicting-work outcome, and protected requests
  through affected and unrelated connections.

### Deployment binding and mapping cardinality

#### MANAGED-040: Database copy does not copy connection authority

- **Setup:** Copy or restore managed connection database state into a distinct
  deployment, including the same human-readable environment label.
- **Action:** Present original connection or credential state to the copied
  deployment.
- **Required result:** Deployment binding fails closed. The copied values and
  matching label do not authorize use.
- **Evidence:** Original and copied deployment identities, request outcome, and
  proof of no protected read or mutation.

#### MANAGED-041: External-person mapping cardinality is enforced

- **Setup:** The named profile publishes its permitted active mapping
  cardinality for external person, Drupal account, client, site, and deployment.
  Prepare both a caller authorized to retire every exact conflict and one that
  lacks authority to retire at least one conflict.
- **Action:** With each caller, attempt a conflicting mapping in each direction
  and an overlapping replacement that conflicts in both directions.
- **Required result:** The implementation either commits the exact permitted
  final mapping and retires every authorized conflict, or changes none. It
  never leaves a partial switch or more active mappings than the profile allows.
  The under-authorized caller's attempt fails without changing any mapping.
- **Evidence:** Published cardinality rule, both callers' authority,
  before-and-after inventory, conflict outcomes, and active-count assertion.

### Bounded connection context and administration

#### MANAGED-050: Bounded context works with no rich provider

- **Setup:** The named profile selects bounded connection context, and no
  optional rich provider is enabled.
- **Action:** Request context for an active connection.
- **Required result:** The context deterministically identifies only the safe
  account label, exact site and deployment or environment, connection and
  policy state, site-advertised provider state, and available review or revoke
  locations selected by the profile.
- **Evidence:** Context result and independently read authoritative connection
  state.

#### MANAGED-051: Bounded context does not enumerate authority or content

- **Setup:** The Drupal account has multiple roles, permissions, accessible and
  inaccessible content, and one optional provider state.
- **Action:** Request bounded connection context and attempt to obtain raw
  authority or content through that foundation operation.
- **Required result:** The context returns no email, serialized user entity,
  raw role identifiers, raw permission names, credentials, accessible-content
  inventory, or prediction that an arbitrary future request will pass.
- **Evidence:** Response and automated forbidden-field assertions.

#### MANAGED-052: Administration uses authoritative connection state

- **Setup:** Create active, degraded, and retired managed states, including an
  active connection whose access credential is missing or expired but whose
  recoverable lineage remains authoritative.
- **Action:** Inspect authorized administrator and person management surfaces
  and revoke one exact connection.
- **Required result:** Inventory does not infer connection existence solely
  from live token rows. It distinguishes actionable connection and provider
  states, exposes no bearer credential, and revokes only the selected
  connection.
- **Evidence:** Authoritative state, UI or API inventory, revoke result, and
  unaffected-connection checks.

#### MANAGED-053: Inactivity uses trusted person-requested use

- **Setup:** The named profile selects an inactivity policy and can distinguish
  person-requested protected use from refresh, health, retry, reconciliation,
  and support traffic. A surviving credential and the profile's explicit
  reactivation or new-connection path are available.
- **Action:** Advance the test clock while sending only background traffic,
  then complete one successful person-requested operation in a separate run.
  In another clean run, cross the inactivity threshold, present the surviving
  credential and each traffic class, then invoke the explicit reactivation or
  new-connection path.
- **Required result:** Background traffic does not advance last-used state. A
  successful person-requested protected operation advances it according to the
  profile. Failed or caller-asserted use does not. Crossing the threshold
  authoritatively retires the connection and denies the next request; surviving
  credentials and later traffic do not reactivate it. Authority returns only
  through the profile's explicit process.
- **Evidence:** Controlled clock, actor category, correlated Drupal result,
  before-and-after last-used and lifecycle state, denied post-threshold
  requests, and explicit reactivation or new-connection result.
- **Applicability:** Profile-activated when inactivity retirement is supported.

#### MANAGED-054: Managed behavior leaves independent clients unchanged

- **Setup:** One explicitly enrolled managed client and one independently
  registered client use separate delegations on the same site.
- **Action:** Exercise managed activation, declared recovery when supported,
  replacement, revocation, and browser logout behavior while the independent
  delegation remains active.
- **Required result:** Managed hooks and state do not globally alter the
  independent client's issuance, refresh, revocation, authorization, or
  browser-session behavior.
- **Evidence:** Before-and-after independent-client requests and lifecycle
  state for both clients.

#### MANAGED-055: Bounded context never presents stale authority as active

- **Setup:** Prime any bounded-context cache for an active connection, then
  prepare isolated cases for a missing, unrecoverable, or mismatched current
  sender or target-tuple member, account block or deletion, eligibility loss,
  managed-client disablement, deployment-binding mismatch, and delegation
  revocation or retirement.
- **Action:** Request bounded context after each mismatch or authority-ending
  state without manually clearing the cache.
- **Required result:** Every request fails closed or reports a non-active safe
  state according to the published interface. Cached context never presents the
  connection as active, exposes protected context, or enables provider behavior
  after authoritative state changes.
- **Evidence:** Primed-cache observation, current-sender and complete
  target-tuple resolution outcome, authoritative state for each case, context
  result, cache-use or invalidation observation, and a denied protected
  request.

## Optional capability-profile qualification

A capability claim is always tied to an exact provider, provider version,
adapter version, capability-profile version, Drupal version, and dependency
set. Qualifying one combination does not qualify another provider or version,
and it does not establish base or managed-profile conformance.

The named capability profile MUST declare its operations, input and result
contract, access semantics, result bounds, continuation behavior, error
categories, and mutation or workflow guarantees before testing.

### Common provider boundary

#### CAP-001: Provider uses the exact resolved account and client

- **Setup:** Two accounts and two clients can reach the candidate provider.
- **Action:** Invoke the same advertised behavior through each delegation.
- **Required result:** Every invocation uses the exact resolved account and
  client. Results and mutations differ only according to current Drupal
  authority and declared operation behavior.
- **Evidence:** Resolved principal/client observations, results, and independent
  Drupal readback.

#### CAP-002: Provider denial cannot trigger fallback

- **Setup:** The candidate provider denies or does not support one requested
  behavior while another broader or legacy route exists in the fixture but is
  not part of the profile.
- **Action:** Invoke the denied or unsupported behavior.
- **Required result:** The provider returns the declared safe outcome and does
  not invoke another route, shared account, broader operation, or semantically
  different write path.
- **Evidence:** Provider and route traces without credentials, failure result,
  and unchanged state.

#### CAP-003: Provider failure leaves the connection intact

- **Setup:** The provider is qualified and the underlying delegation is active.
- **Action:** Disable the provider or inject a transport failure.
- **Required result:** The capability becomes unavailable with the declared
  category. The connection remains authoritative, and no other provider is
  silently enabled.
- **Evidence:** Provider and connection state before and after failure.

### Read-profile qualification

#### CAP-010: Accessible result is returned

- **Setup:** The fixture contains a known item and allowed fields accessible to
  `account_a`.
- **Action:** Invoke each advertised read behavior that should find it.
- **Required result:** The item is returned within the declared result and
  completeness bounds with the profile's required identity or citation.
- **Evidence:** Request, structured result, and direct Drupal readback.
- **Applicability:** Required for profiles that advertise reads.

#### CAP-011: Protected items and fields do not leak

- **Setup:** The fixture contains inaccessible items, protected fields,
  relationships, referenced labels, and a result set where protected matches
  would affect a raw total.
- **Action:** Invoke each advertised read, filter, aggregate, and relationship
  behavior as accounts with different access.
- **Required result:** No protected item, field, relationship, label, count, or
  inference is returned. Pagination and totals do not reveal filtered records.
- **Evidence:** Known fixture inventory, per-account results, forbidden-value
  assertions, and direct readback.
- **Applicability:** Required for profiles that advertise reads.

#### CAP-012: Current access changes affect reads

- **Setup:** A known item is initially accessible through the provider.
- **Action:** Remove the relevant Drupal access, repeat the read, restore it,
  and repeat again without reconnecting.
- **Required result:** The item disappears or is denied immediately after
  removal and returns only after all applicable access checks pass again.
- **Evidence:** Access-state changes and three provider results.
- **Applicability:** Required for profiles that advertise reads.

#### CAP-013: Bounds and continuation are honest

- **Setup:** Accessible results exceed the declared page or result bound and
  include inaccessible items between accessible ones.
- **Action:** Follow continuation until exhaustion.
- **Required result:** Continuation advances without duplicates or loops,
  protected results and counts remain hidden, and the provider states any
  completeness limit rather than implying exhaustive search.
- **Evidence:** Ordered returned identifiers, continuation values or safe
  fingerprints, request count, and fixture comparison.
- **Applicability:** Required when the profile advertises multi-result reads.

### Mutation and workflow qualification

#### CAP-020: Resource and field authorization are exact

- **Setup:** The profile advertises a mutation affecting one allowed and one
  protected resource or field.
- **Action:** Invoke each mutation as accounts with different authority.
- **Required result:** Only authorized resources and fields change. The
  provider does not strip a denial and apply the remainder unless its published
  partial-outcome contract explicitly permits that behavior.
- **Evidence:** Request, item-level outcome, and before-and-after Drupal
  readback.
- **Applicability:** Required for profiles that advertise mutations.

#### CAP-021: Validation failure causes no undeclared partial mutation

- **Setup:** Supply input that fails one required Drupal validation rule.
- **Action:** Invoke the mutation.
- **Required result:** The provider returns the declared validation category.
  State remains unchanged unless the profile explicitly defines and reports a
  safe item-level partial outcome.
- **Evidence:** Structured failure and before-and-after entity and revision
  readback.
- **Applicability:** Required for profiles that advertise mutations.

#### CAP-022: Workflow semantics remain Drupal-owned

- **Setup:** The fixture has allowed and denied workflow transitions for
  different accounts.
- **Action:** Invoke every advertised draft, transition, review-queue, or
  publication-related behavior.
- **Required result:** Current item, revision, translation, assignment, and
  transition access is enforced. A draft-only operation does not publish or
  choose a broader transition. A queue claim is based on the profile's declared
  access semantics rather than a role name, state label, or text match.
- **Evidence:** Workflow configuration, per-account outcomes, and state and
  revision readback.
- **Applicability:** Required when workflow behavior is advertised.

#### CAP-023: Conflict does not overwrite newer state

- **Setup:** Record an expected revision, then create a newer human or test
  revision before the provider mutation.
- **Action:** Invoke the mutation using the stale expectation.
- **Required result:** The provider returns the declared conflict category and
  does not overwrite the newer state.
- **Evidence:** Revision sequence, structured conflict, and final readback.
- **Applicability:** Required when the profile advertises expected-revision or
  conflict-safe mutation.

#### CAP-024: Batch outcomes follow the published transaction policy

- **Setup:** A batch contains authorized, denied, invalid, and conflicting
  items.
- **Action:** Invoke the batch behavior.
- **Required result:** The provider follows its declared atomic or item-level
  partial-outcome policy exactly. Every committed and rejected item is
  explicit, and no undeclared state change occurs.
- **Evidence:** Structured item outcomes and independent readback for every
  item.
- **Applicability:** Required when batch behavior is advertised.

### Errors and provenance

#### CAP-030: Failure categories remain distinguishable

- **Setup:** Prepare separate authorization denial, validation failure,
  conflict, unsupported behavior, provider-unavailable, and transport-failure
  conditions that apply to the advertised profile.
- **Action:** Trigger each condition independently.
- **Required result:** Each returns the profile's distinct safe category and a
  supportable correlation reference. No response recommends widening an
  external permission model or reveals protected data.
- **Evidence:** One sanitized response and correlated diagnostic record per
  category.

#### CAP-031: Mutation provenance preserves account and client

- **Setup:** The profile advertises a mutation and the implementation exposes
  registered-client provenance.
- **Action:** Perform the same mutation through two clients under one Drupal
  account.
- **Required result:** Drupal's operation-actor or revision-creator attribution
  remains the connected account. Any declared content-author reassignment
  follows current Drupal authorization and remains distinct from acting-account
  and client provenance. Provenance distinguishes the clients without claiming
  proof of a particular model or human origin.
- **Evidence:** Entity or revision readback and provenance records.
- **Applicability:** Required for mutation profiles that claim client
  provenance.

## Execution and evidence requirements

### Test execution

Every run MUST:

1. start from the declared fixture state;
2. record the exact contract, suite, implementation, profile, provider,
   Drupal, and dependency versions;
3. exercise the normal public authorization and protected-request path rather
   than relying only on directly inserted tokens or state;
4. use controlled fault injection for race, lost-response, and unavailable
   provider cases;
5. verify consequential results through an independent Drupal readback path;
6. retain both successful and denied outcomes; and
7. restore or recreate the fixture before another scenario unless an ordered
   sequence is declared.

Low-level injected credentials MAY support a narrowly scoped negative test,
but they MUST NOT be the only evidence for establishment, revocation,
continuity, or interoperability.

### Required evidence per scenario

Each scenario record MUST include:

- scenario ID and suite version;
- applicability and the reason for any non-applicable result;
- fixture and configuration fingerprint;
- exact action or request, with credentials and private values removed;
- expected and observed outcome;
- safe resolved account, client, external-person, connection, and target
  identifiers when applicable;
- response status and normalized outcome category;
- independent precondition and final-state readback;
- correlation reference for supporting diagnostics;
- retained artifact paths relative to the evidence bundle;
- verdict: `pass`, `fail`, `not-applicable`, `skipped`, `unsupported`, or
  `indeterminate`; and
- reviewer or runner identity expressed as a role or non-personal identifier.

The agent or client's natural-language response MUST NOT be the sole proof of
authority, data returned, or state changed.

### Secret and privacy boundary

Retained evidence MUST NOT contain:

- access or refresh tokens;
- authorization codes;
- passwords, cookies, or session identifiers;
- client secrets;
- private signing or encryption keys;
- production account identifiers or personal information;
- customer content; or
- machine-local absolute paths.

Opaque test identifiers, safe hashes, redacted request shapes, and
repository-relative artifact paths SHOULD be used instead. Redaction MUST
preserve the information needed to distinguish accounts, clients, connections,
generations, requests, and outcomes.

### Run manifest

Each run MUST publish a machine-readable manifest and a human-readable report.
The manifest contains at least:

```yaml
suite_version: 0.1.0-draft
contract_version: 0.1.0-draft
claim:
  type: contract-conformant
  profile_id: null
  provider_id: null
implementation:
  name: example
  version: 0.0.0
claimant:
  name: example-project
runner:
  id: example-ci-runner
review:
  level: self-attested
  reviewer: example-maintainer-role
  evidence_digest: sha256:example
environment:
  drupal_version: 0.0.0
  dependency_versions:
    - name: example-package
      version: 0.0.0
  dependency_fingerprint: sha256:example
  fixture_version: 0.0.0
scenarios:
  - id: BASE-001
    applicability: required
    verdict: pass
    evidence:
      - evidence/base-001/result.json
summary:
  pass: 1
  fail: 0
  not_applicable: 0
  skipped: 0
  unsupported: 0
  indeterminate: 0
```

The report MUST list every scenario, not only failures. It MUST state the exact
claim supported, all limitations, every excluded feature, and whether any
failed, skipped, unsupported, or indeterminate scenario blocks that claim.

Evidence bundles SHOULD include checksums so later reviewers can determine
whether retained artifacts changed after the verdict.

## Publishing a conformance claim

Every published claim MUST name its claimant, runner, reviewer, evidence
location or digest, and review level as `self-attested` or `independent`.
Self-attestation MUST NOT imply endorsement by the Drupal Security Team, the
Agent Access maintainers, or another organization. A future governance process
MAY define separately named recognition without changing the underlying test
results.

Before publication, the reviewer named in the report MUST verify:

- every scenario required by the claim is present;
- every applicable verdict is `pass`;
- every scenario's applicability matches the normative profile and published
  feature declaration;
- provider qualification names an exact versioned combination;
- independent Drupal readback supports every consequential claim;
- no agent response is being treated as final truth;
- the bundle passes its secret and privacy checks; and
- limitations and non-applicable cases are visible in both the manifest and
  report.

A later dependency, configuration, interface, provider, or profile change
invalidates only the affected claim, but that claim MUST be rerun before it is
re-published for the changed combination.
