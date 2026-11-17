# Drupal Agent Access contract

> **Status:** Proposed
>
> **Contract version:** `0.1.0-draft`
>
> **Implementation status:** This is the normative behavioral source proposed
> for the next major Agent Access foundation. The current experimental `1.0.x`
> recipe does not claim conformance. A reusable runtime interface and executable
> conformance suite do not exist yet, so this repository is the drafting
> location rather than proof of a complete implementation.

## Purpose

Drupal Agent Access lets a site give an external agent the connected Drupal
account's real, current power without creating a second permission system.
Nothing in Agent Access may give the agent more Drupal authority than that
account currently has.

The contract defines how an external client acts through one exact Drupal
account while Drupal remains authoritative and the acting account and
registered client remain separately attributable.

The base personal contract uses an account-bound OAuth delegation. It is
neutral about the capability transport layered on top. MCP, JSON:API, Tool API,
and other adapters may expose capabilities, but none of them defines the
connection or its authority.

This contract exists so that sites, clients, and managed platforms can share
one small Drupal-side promise without adopting the same product, transport, or
distribution recipe.

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**,
and **MAY** are to be interpreted as described in
[BCP 14](https://www.rfc-editor.org/info/bcp14) (RFC 2119 and RFC 8174) when,
and only when, they appear
in all capitals, as shown here.

## Contract, runtime, and recipe are different artifacts

This document states the durable behavior.

A future provider-neutral Agent Access runtime is expected to expose the
reusable extension points and executable tests needed to implement that
behavior. A recipe may distribute a conforming runtime and optional capability
providers. Neither a module name nor a recipe package is evidence of
conformance by itself.

The current `1.0.x` recipe is an experimental OAuth and MCP distribution. It is
useful evidence and an optional interoperability on-ramp, but it has current
security and lifecycle limitations documented in `README.md` and `SECURITY.md`.
It is not the protocol-neutral foundation described here.

## Core invariants

The base contract governs:

- an account-bound OAuth delegation;
- resolution of the exact Drupal account and registered OAuth client from
  validated request context;
- Drupal-owned enablement and account-eligibility policy;
- current Drupal authorization and validation whenever protected behavior
  executes, including deferred work;
- non-elevation and fail-closed behavior;
- separate account and client attribution;
- visible, exact delegations and revocation effective on the next request;
- isolation among accounts and clients; and
- independence from any capability transport.

It does not define exact endpoints, payloads, claims, algorithms, token formats,
tool schemas, or product interfaces.

## Terms

**Drupal account**
: The real, loadable Drupal user account whose current authority is evaluated
  for the request.

**Registered client**
: The OAuth client registered with Drupal for the request. Client attribution
  does not by itself prove which model, agent instance, or human originated a
  request. The current `1.0.x` implementation represents this registration as a
  Simple OAuth Consumer entity.

**Account-bound delegation**
: An OAuth grant connecting one registered client to one Drupal account. A
  conformance claim separately identifies any additional named profile.

**Connection**
: The durable, revocable relationship represented by that delegation. An
  individual access token is a replaceable credential, not the connection.

**Capability provider**
: An enabled adapter that exposes content, context, or operations through MCP,
  JSON:API, Tool API, or another interface.

**Profile**
: A named set of additional establishment, assurance, lifecycle, or narrowing
  rules. A profile may strengthen this contract and may narrow authority. It
  may not weaken or expand the base authority boundary.

## Base authority contract

### Resolve the exact account and client

Every protected request MUST resolve both the exact Drupal account and exact
registered client from validated request context before application behavior
runs.

If either cannot be recovered and validated, the request MUST fail closed. An
implementation MUST NOT substitute a registered-client default, anonymous account,
system account, shared agent account, different Drupal account, or legacy
authentication path.

Caller-supplied account, client, or identity fields are not proof of a binding.

### Let Drupal control establishment and use

Drupal-owned policy MUST control whether Agent Access delegations may be
established or used. It MUST let an authorized site administrator disable Agent
Access site-wide and determine which accounts and registered clients are
eligible to establish and retain a delegation.

An external platform MUST NOT override that decision. Site disablement,
registered-client disablement, or loss of account eligibility MUST deny the
next protected request without changing unrelated OAuth clients or Drupal
permissions. Restoring eligibility or enablement MUST NOT silently reactivate a
delegation that Drupal authoritatively retired.

### Drupal is the sole authority for Drupal operations

Drupal MUST make the authorization decision for every Drupal read or operation
and every applicable validation decision for a mutation.

The effective authority of a request MUST never exceed the connected account's
current Drupal authority. A grant, profile, site policy, or capability provider
may narrow that authority further. It MUST NOT add a role, permission, grant,
or access result the account does not currently hold.

Agent Access MUST NOT infer unrestricted authority from an account identifier.
When Drupal's configured access policies give the exact connected account
unrestricted authority, the delegation has that same unrestricted current
authority. Authorized delegation inventory MUST identify that condition, and
site or profile policy MAY prohibit the delegation.

An external platform, product entitlement, organization membership,
conversation mode, approval step, tool catalog, capability manifest, or client
registration MUST NOT grant Drupal authority.

A conforming implementation MUST NOT copy Drupal roles, permissions, entity
access, field access, workflow access, or custom access rules into a second
permission model and treat that copy as authoritative.

### Evaluate authority at request time

Drupal MUST evaluate the current account and exact request when the request is
made. Applicable route, entity, field, revision, translation, workflow,
validation, node-access, and custom access checks MUST still run.

An ordinary Drupal access change MUST take effect on the next applicable
request without recreating the delegation. Restoring one permission guarantees
only that the corresponding permission check may pass. Other access and
validation checks remain authoritative.

### Preserve authority across deferred execution

If a protected request schedules later Drupal behavior through cron, a queue,
the Batch API, or another worker, the deferred record MUST carry a non-secret
reference to the exact delegation, Drupal account, registered client, and
intended operation.

Before each protected read or mutation executes, the worker MUST re-resolve the
account and client and run then-current Drupal authorization and validation for
the exact operation. It MUST fail closed after revocation, site or client
disablement, account block or deletion, or eligibility loss. The ambient cron,
queue, anonymous, system, or worker account MUST NOT substitute for the
delegated account, and bearer credentials or serialized authority MUST NOT be
stored in deferred work state.

### Keep account and client attribution distinct

Drupal access checks MUST run through the exact connected Drupal account. Where
Drupal automatically records the operation actor or revision creator, it MUST
record that account.

A declared capability MAY set content ownership or authorship to another
account only when Drupal's current entity, field, workflow, and validation
checks authorize the exact change. Content ownership MUST NOT substitute for
the separately retained acting-account and registered-client provenance.

The registered client MUST remain separately recoverable in Drupal request
context for provenance, audit, incident response, and client-specific
revocation. Drupal MUST expose the acting account and client to site-controlled
audit and operation-recording integrations.

For delegation lifecycle events and attempted mutations, Drupal MUST emit a
site-controlled provenance event with a safe correlation reference, acting
account, registered client, action or target, and normalized outcome. The event
MUST NOT contain a bearer credential or protected payload. This contract does
not require a durable log of every read or prescribe whether a site retains the
event in Drupal or a site-controlled external sink.

Implementations MUST describe the assurance they actually provide and MUST NOT
present client attribution as cryptographic proof of a particular agent or
model.

### Never create authority to make a request succeed

Agent Access MUST NOT create roles, grant permissions, mutate the account, or
elevate a principal to make an operation work.

When Drupal denies a request, the remedy is ordinary Drupal administration, a
different request, or a broader delegation only where the selected profile
supports narrowing. It is never an invisible fallback to broader authority.

A generic personal profile MAY let the person authorize a narrower grant. A
managed profile MAY intentionally use one full account-bound delegation with no
customer scope picker. Both conform only while every request remains within the
account's current Drupal authority.

### Make delegations visible and revocable

An authorized site administrator MUST be able to enumerate every active Agent
Access delegation they may manage with enough Drupal-controlled account,
registered-client, profile, and lifecycle state to distinguish and revoke the
exact delegation. A person MUST be able to identify and revoke their own active
delegations. Inventory MUST NOT expose bearer credentials or equivalent reusable
secrets.

A person or authorized site administrator MUST be able to revoke a personal
delegation. Revocation MUST deny the next protected request and MUST prevent a
surviving credential from restoring the revoked authority.

Account block or deletion and registered-client disablement or deletion MUST
also fail closed. Restoration MUST NOT silently reactivate a delegation that
Drupal authoritatively retired.

### Preserve safe failure semantics

Implementations MUST preserve a safe distinction, where applicable, among:

- absent, invalid, or revoked delegation;
- site disablement or account ineligibility;
- Drupal authorization denial;
- Drupal validation or workflow conflict;
- capability unavailable or incompatible;
- transport or system failure; and
- uncertain mutation outcome.

Person-facing messages MAY coarsen sensitive detail. Authorized administration,
support, and conformance evidence MUST retain the safe reason class and a
correlation reference. A transient provider or replaceable-credential failure
MUST NOT be presented as authoritative revocation or a required reconnection.

### Keep clients and accounts isolated

Changing, revoking, or recovering one account, client, or delegation MUST NOT
change the authority or lifecycle of an unrelated account, client, or
delegation.

Managed-profile behavior MUST apply only to clients explicitly enrolled in
that profile. It MUST NOT globally alter the issuance, refresh, revocation, or
browser-session behavior of unrelated registered OAuth clients.

### Keep capability transport separate

The base Agent Access runtime MUST be installable and operable without MCP,
JSON:API, Tool API, a content provider, an operation provider, or an embedded
interface.

An enabled capability provider MUST use the resolved account and client and
MUST run current Drupal authorization and validation for the exact operation.
Transport selection, module presence, or catalog visibility MUST NOT substitute
for that decision.

Provider availability and connection authority are separate. Disabling or
losing one provider MUST NOT silently revoke the delegation, enable a different
provider, or trigger fallback to a legacy, shared, broader, or unreviewed route.

Agent Access conformance does not certify every site-enabled provider. A named
capability profile requires its own qualification evidence.

## Required runtime contract surfaces

A complete reference implementation needs reusable runtime surfaces for the
behaviors below. This contract does not prescribe PHP interfaces or wire
schemas, but an implementation MUST make the behaviors testable.

1. **Principal and client resolution:** derive the exact Drupal account and
   registered client from validated request context.
2. **Request enforcement:** give protected routes and providers one consistent
   fail-closed way to require the resolved delegation and current Drupal
   authority.
3. **Connection lifecycle:** expose revocation and any profile-specific active,
   inactive, or retired state needed to make the next request authoritative.
4. **Inventory and discovery:** let a site identify its active connection
   surface and advertised capability providers without exposing bearer
   credentials.
5. **Provenance:** expose the acting Drupal account and registered client to
   applicable audit and operation-recording systems.
6. **Conformance test base:** let implementations and profiles prove the shared
   behaviors without reinterpreting the prose independently.

The selected APIs, state model, event shape, and discovery document belong in a
versioned interface or interoperability profile.

## Profiles

### Personal delegated profile

The base personal profile uses an account-bound OAuth authorization grant. The
person acts through their own Drupal account and can revoke the delegation.
Drupal remains independently able to revoke it.

A personal grant may be full account-bound authority or may be narrowed by a
named profile. The narrowing mechanism is not part of the base contract, and no
scope may add Drupal authority.

### Managed personal connection profile

A managed profile is an additional contract, not behavior inherited by every
OAuth client. It may add an external person identity, an intentionally
provisioned client, server-side credential custody, a durable logical
connection, activation and replacement, deployment binding, eligibility,
inventory, bounded connection context, inactivity policy, and managed recovery.

A named managed profile MAY strengthen or narrow the base contract. It MUST NOT
weaken or expand the base authority boundary. Its behavior MUST apply only to
explicitly enrolled clients and MUST NOT alter unrelated OAuth clients.

The exact requirements belong in the separately versioned
[`docs/MANAGED-PERSONAL-PROFILE.md`](docs/MANAGED-PERSONAL-PROFILE.md) and its
interface specifications. Implementing the base contract does not imply
managed-profile conformance.

### Independently registered clients

Independent clients retain Drupal's supported OAuth lifecycle. They MAY use a
narrower scope, resource, or audience profile when Drupal supports one. They do
not inherit managed activation, custody, or provenance behavior merely because
they use the same account.

### Unattended authority

This contract defines account-bound delegated access. It does not define or
certify unattended or service-account authority.

Any future unattended model requires a separately reviewed profile and, if it
changes the non-elevation invariant, a new major contract version. It MUST NOT
be used as fallback for a failed personal request.

## Conformance

Conformance is an evidence claim, not an architectural intention. A package or
profile MUST NOT call itself conformant until its named version passes the
applicable executable suite against real Drupal requests with independent state
readback.

The base claim MUST pass every applicable `BASE-*` scenario in the exact named
version of [`docs/CONFORMANCE.md`](docs/CONFORMANCE.md). The suite defines how to
prove the contract; it does not replace or silently expand the normative
requirements in this document.

A named managed profile adds its own lifecycle, identity, deployment,
concurrency, continuity, and administration cases. A named capability profile
adds its own access-correctness and behavior cases.

Conformance reports MUST identify the contract version, profile and
implementation versions, Drupal and dependency versions, tested providers,
failed or unsupported cases, and retained evidence boundary.

Each published claim MUST identify its claimant, runner, evidence location or
digest, and self-attested or independent review level. A self-attested result
MUST NOT imply endorsement by the Drupal Security Team, Agent Access
maintainers, or another organization. A later governance process MAY define
separately named recognition without changing the underlying result.

Claims SHOULD distinguish:

- **`contract-conformant`:** the base authority and connection behavior
  passes;
- **`profile-conformant:<profile-id>`:** a named personal or managed profile
  passes its additional requirements; and
- **`provider-qualified:<profile-id>`:** a named adapter, version, and
  capability profile passes its behavior-specific suite.

## Companion artifacts and current gaps

Behavioral conformance does not establish wire interoperability. The following
companions are required before two independent implementations can claim they
interoperate:

| Artifact | Purpose | Current status |
|---|---|---|
| [Interop profile](docs/INTEROP-PROFILE.md) | Cross-implementation semantics and version requirements | Proposed `0.1.0-draft` |
| Versioned interface specification | Exact wire contracts, identifiers, schemas, and assurance choices | Not yet defined |
| [Conformance suite](docs/CONFORMANCE.md) | Test suites and evidence | Proposed `0.1.0-draft` |
| [Managed](docs/MANAGED-PERSONAL-PROFILE.md) | Managed connection | Proposed `0.1.0-draft` |
| Named capability profile | Advertised operations | Profile owned |

The absence of a companion does not make the corresponding behavior optional.
It means an interoperability, profile, or conformance claim is not ready.

## Non-goals

This contract does not:

- select a particular OAuth server implementation;
- select MCP, JSON:API, Tool API, or another capability transport;
- define exact OAuth scopes, resources, audiences, claims, endpoints, token
  formats, or cryptographic choices;
- define a tool or operation catalog;
- define a parallel product, agent, or Agent Access permission model;
- certify the current `1.0.x` recipe or its dependencies;
- require a particular Simple OAuth hook or compatibility mechanism;
- define product modes, billing, credits, conversation retention, or
  organization governance;
- define administrator-provisioned batch personal connections; or
- define unattended authority.

## Security considerations

This contract contains an agent to the exact connected account's current Drupal
authority. It does not make every action within that authority safe. Prompt
injection, malicious instructions, a compromised client, or stolen credentials
may exercise every operation that Drupal currently permits for that account.

The residual risk therefore depends on Drupal account and permission hygiene,
site eligibility policy, registered-client assurance, credential protection,
provider correctness, and prompt or content trust boundaries. A delegation for
an account with unrestricted Drupal authority is itself unrestricted and MUST
be shown that way in authorized administration.

Provider qualification is separate from connection conformance. A broken
provider or Drupal access-control defect can still disclose or mutate data.
Deferred work must preserve and re-evaluate the delegated authority, and
provenance or diagnostic records must not retain credentials or protected
payloads. Deployment-copy isolation and external-person binding are guaranteed
only by a named profile that defines and proves them.

## Relationship to other specifications

| Artifact | What it answers |
|---|---|
| This contract | What every conforming Agent Access implementation preserves |
| Product specification | What a product ships and what people and administrators experience |
| Architecture specification | Which systems own and realize the responsibilities |
| Interface specification | Exact routes, payloads, outcomes, errors, and extension points |
| Interoperability profile | How independent implementations exchange and validate data |
| Capability profile | Which optional operations are advertised and qualified |
| Conformance suite and report | What was actually tested and what passed |
| Decision record | Why load-bearing choices changed |
| Installation documentation | How to install and operate one implementation |

A product may prove and shape this contract before a reusable Agent Access
runtime is released. It does not need to depend on the Agent Access recipe to
conform. Shared implementations and tests are preferred where they avoid drift,
but package ownership remains an architecture decision until published.

## Versioning and change control

The contract is versioned independently from the recipe and runtime:

- a patch clarifies behavior without changing conformance;
- a minor version may add a backward-compatible base extension point or
  non-normative guidance without changing existing conformance; and
- a major version adds or changes a mandatory base requirement or changes an
  existing profile incompatibly.

Separately versioned profiles may be added or revised without a contract release
unless they change a base requirement or the contract's relationship to that
profile.

The draft becomes `1.0.0` only after public review, a versioned interface
specification and the applicable interoperability profile, and an executable
conformance suite exist. Normative changes SHOULD be proposed in the public
Agent Access issue queue and reviewed with maintainers of the affected Drupal
authorization, OAuth, transport, capability, and security boundaries.
