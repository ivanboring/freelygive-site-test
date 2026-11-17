# Drupal Agent Access managed personal connection profile

> **Status:** Proposed
>
> **Profile version:** `0.1.0-draft`
>
> **Depends on:** Drupal Agent Access contract `0.1.0-draft`
>
> **Interoperability profile:** [Drupal Agent Access interoperability profile](INTEROP-PROFILE.md)
> `0.1.0-draft`
>
> **Conformance suite:** [Drupal Agent Access conformance](CONFORMANCE.md)
> `0.1.0-draft`
>
> This profile defines observable behavior for a managed, durable personal
> connection. It does not define wire schemas, PHP interfaces, storage tables,
> lock algorithms, or a particular managed product.

## Purpose

This profile lets a currently authenticated person use a managed external
client through one exact Drupal account while Drupal remains the authorization
authority.

The person sees one durable connection. Underneath it, Drupal issues one full
account-bound OAuth delegation to one intentionally provisioned managed client.
Optional capability providers may use that delegation, but they do not create
additional personal connections, grants, permission models, or consent
ceremonies.

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**,
and **MAY** are to be interpreted as described in
[BCP 14](https://www.rfc-editor.org/info/bcp14) (RFC 2119 and RFC 8174) when,
and only when, they appear
in all capitals, as shown here.

## Relationship to the base contract

An implementation claiming conformance with this profile MUST first conform to
the Drupal Agent Access contract version named above.

This profile adds requirements for:

- binding a currently authenticated external person to an exact Drupal target;
- a provisioned managed OAuth client;
- one full account-bound delegation with no customer scope picker;
- durable encrypted server-side credential custody;
- activation, replacement, reconciliation, and visible lifecycle outcomes;
- a bounded connection-context operation;
- independence from optional capability transports; and
- bidirectional mapping cardinality.

Implementing the base contract does not imply conformance with this profile.

## Terms

**External person**
: The human currently authenticated by the managed platform, identified by an
  immutable issuer and subject pair. Email and organization membership are not
  identity keys.

**Current sender**
: The external person authenticated for the request being processed now. A
  sender saved on a conversation, workspace, project, organization, browser
  field, or opaque connection reference is not the current sender.

**Managed client**
: The exact OAuth client intentionally provisioned or enrolled for this
  profile. It has no default or fallback Drupal account.

**Target tuple**
: The exact external issuer and subject, Drupal account, managed client, Drupal
  site, and deployment bound to one personal connection.

**Logical connection**
: The durable, visible, revocable relationship represented by the target tuple.
  Access and refresh credentials are replaceable custody material, not the
  connection itself.

**Capability provider**
: An optional reviewed adapter that exposes content, context, or operations
  through MCP, JSON:API, Tool API, or another transport.

## Profile invariant

For each active target tuple, the system MUST represent exactly one visible
personal connection and one full account-bound Drupal OAuth delegation.

The delegation MUST NOT create or copy Drupal authority. Drupal MUST evaluate
the connected account's current authority and all applicable validation for
every application request.

A managed-platform entitlement, organization, project, conversation mode,
approval, tool catalog, provider manifest, or locally cached connection state
MUST NOT grant or predict Drupal authority.

## Personal establishment and current-sender binding

### Establish the connection from both authenticated identities

This baseline profile declares contemporaneous person action as the authority
to establish the personal connection. A profile based on prior or
administrator-delegated site policy is a different, separately reviewed
profile.

The baseline connection flow MUST bind a person who controls both the external
identity and the existing Drupal account. It MUST NOT create a Drupal account or
infer a binding from matching email, organization membership, or a caller-
supplied account identifier.

Before activation, the person MUST be shown or otherwise given an unambiguous
confirmation of the external identity, Drupal account, site, and deployment
being connected.

Authenticated evidence completing the connection MUST be bound to the exact
attempt and target tuple. Evidence for another account, client, site,
deployment, person, expired attempt, or consumed attempt MUST fail closed and
MUST NOT alter another connection.

### Re-establish the current sender for every use

Before the managed platform uses a connection, it MUST re-establish the current
sender from its active authentication boundary and select a connection whose
external issuer and subject match that sender exactly.

The managed platform MUST then validate the complete target tuple before
leasing or presenting a credential. Conversation history, an earlier sender, a
selected project, an organization, a browser-supplied identity, or possession
of an opaque connection identifier MUST NOT transfer or broaden the
connection.

If the current sender or any target-tuple member cannot be recovered and
validated, the request MUST fail closed without substituting another person,
Drupal account, client, site, or deployment.

Site and deployment validation MUST rely on evidence that a database copy alone
cannot reproduce. Cloning, restoring, or promoting copied connection state into
another deployment MUST NOT make the copied connection valid merely because a
database identifier or human-readable environment label still matches.

## Managed OAuth client and delegation

### Provision the managed client intentionally

The managed client MUST be intentionally provisioned or enrolled for this
profile. Dynamic Client Registration MUST be absent or disabled by default and
MUST NOT be required for the managed connection.

An administrator MAY enable Dynamic Client Registration separately for
independent clients. Those clients MUST retain Drupal's ordinary OAuth
lifecycle and MUST NOT inherit this profile's activation, custody, mapping, or
recovery behavior.

The managed client MUST NOT designate a default, anonymous, system, shared, or
fallback Drupal account. Every protected request MUST resolve the exact account
from the validated account-bound delegation.

### Use one full account-bound delegation

Drupal MUST issue one full account-bound delegation for the logical connection.
The managed profile MUST NOT expose a customer scope picker, a parallel
permission list, per-provider grants, or per-capability OAuth consent.

If the OAuth framework requires a scope or marker to issue the grant, the
profile MUST fix it internally, MUST NOT make it customer-configurable, and MUST
NOT present it as defining capability or Drupal permission.

The delegation MUST NOT freeze Drupal roles, permissions, workflow access, or
other authorization at issuance. A Drupal access change MUST affect the next
applicable request without recreating the connection.

## Drupal-owned authorization and lifecycle authority

Drupal MUST authorize every read and operation under the exact connected
account. Route, entity, revision, translation, field, workflow, validation,
node-access, and custom access checks MUST continue to apply.

The following Drupal-owned outcomes MUST stop subsequent application use:

- person or authorized administrator revocation;
- Drupal account block or deletion;
- loss of connection eligibility;
- managed-client disablement, deletion, or incompatible profile state;
- site-wide integration disablement;
- target-tuple or deployment-binding mismatch;
- profile-defined security or inactivity retirement; and
- authoritative retirement of the active delegation.

A surviving or newly returned credential MUST NOT reactivate authority after
one of these outcomes. Reactivation requires the profile's explicit new-
connection or reactivation process.

Ordinary permission changes do not end the connection. Drupal applies them on
the next request. Ordinary Drupal browser logout, a benign account save,
credential rotation, access-token expiry, a recoverable access-credential
rejection, and optional-provider failure MUST NOT by themselves end an
otherwise-valid connection.

## Encrypted server-side custody

Reusable access and refresh credentials MUST remain inside an isolated,
server-side custody boundary and MUST be encrypted at rest using an approved
managed key system.

Credential plaintext MUST NOT enter model input, prompts, conversation state,
browser state, ordinary application logs, traces, analytics, support exports,
or capability-provider configuration.

Credential access and use MUST be independently auditable without recording
the credential or protected Drupal content.

Custody MUST remain bound to the exact target tuple and logical connection. A
credential or custody handle from one tuple MUST NOT be usable for another.

## Activation, replacement, and reconciliation

This section defines observable outcomes. It does not prescribe transactions,
tables, leases, lock order, generation counters, or a saga implementation.

### Activation

A newly issued managed delegation MUST NOT authorize application data access or
capability-provider use until:

1. the managed platform has durably accepted encrypted custody for the exact
   target tuple; and
2. Drupal has authoritatively committed that exact delegation as active.

The connection MUST become visibly active only after the managed platform has
validated Drupal's committed outcome. A pending delegation MAY authenticate
only narrowly bounded lifecycle control needed to activate, resolve, or abandon
that exact pending operation; it MUST NOT authorize application data, bounded
connection context, or optional providers.

### Replacement

A replacement MUST have one of two observable results:

- the exact new target tuple and delegation become active and every exact prior
  conflicting mapping named by the operation is retired; or
- the prior active connection remains authoritative and the new delegation
  remains unable to authorize application requests.

A replacement MUST NOT leave two active mappings, retire an unrelated
connection, or leave no active mapping solely because a pre-commit replacement
failed.

If Drupal has committed the replacement but a later readiness or provider check
fails, the new connection remains the authoritative connection and is shown as
degraded or needing attention. Optional-provider failure MUST NOT roll back the
committed connection.

### Uncertain outcomes and reconciliation

When a timeout, lost response, or interruption makes an activation,
replacement, revocation, or abandonment outcome uncertain, neither side may
infer success or failure from transport status alone.

The system MUST retain enough protected custody and operation identity to ask
Drupal for the authoritative outcome. Repeating resolution for the same exact
operation MUST return the same committed result or an authoritative result that
the operation did not commit. Conflicting lifecycle work MUST remain blocked
until the uncertainty is resolved safely.

Reconciliation MUST NOT create a second mapping, activate a different grant,
restore retired authority, discard the prior connection without proof, or
retire an unrelated connection.

### Recoverable credential rejection

An access-credential rejection alone MUST NOT mark an otherwise-active logical
connection revoked or require the person to reconnect.

An implementation MAY provide automatic credential recovery. When it does,
recovery MUST first revalidate the current sender, exact target tuple, and
authoritative Drupal lifecycle. It MUST be bounded and concurrency-safe and
MUST NOT overwrite newer custody. Automatic request retry is separately
optional; when provided, it MUST retry an application operation only when the
system knows the original operation did not execute. An uncertain mutation MUST
NOT be retried in a way that could duplicate it.

An implementation without automatic recovery MUST preserve the logical
connection's authoritative state and report an actionable credential failure
without misclassifying it as revocation.

## Optional providers and transports

The logical connection and full account-bound delegation MUST exist and remain
reviewable without MCP, JSON:API, Tool API, an operation provider, a content
provider, or an embedded interface.

Every enabled provider MUST use the same active delegation, resolved Drupal
account, and managed client. Transport selection and provider exposure MUST NOT
replace Drupal authorization.

Enabling, disabling, replacing, losing, or restoring a provider changes only
the availability and health of the capabilities it advertises. It MUST NOT:

- create or end the logical connection;
- create another OAuth grant or consent ceremony;
- change another provider's health;
- change credential custody or Drupal authority; or
- trigger fallback to a legacy route, shared account, broader operation, or
  unreviewed adapter.

A provider may be shown as available only for the exact adapter, version, and
profile that passed its required qualification. Provider qualification is a
separate evidence claim from connection-profile conformance.

## Bounded connection context

The required connection foundation MUST expose a deterministic, access-checked
context for the currently authenticated person without depending on an optional
capability provider.

For an active connection, the context MAY contain:

- a safe Drupal account display label;
- exact site and deployment labels;
- authoritative connection and effective policy state;
- site-advertised provider availability; and
- review and revoke locations.

The context MUST NOT contain:

- credentials or custody handles;
- email or a serialized Drupal account;
- raw role identifiers or permission names;
- Drupal content, protected counts, or an access inventory; or
- a claim that predicts authorization for an arbitrary future request.

The managed platform MAY compose Drupal-owned context with its own provider
compatibility and health information, but it MUST keep the source and meaning of
those states distinguishable.

If the current sender, target tuple, account status, eligibility, managed
client, deployment binding, or active delegation cannot be validated, the
context request MUST fail closed. Cached context MUST NOT be used to present the
connection as active.

## Mapping cardinality

For one managed profile on one Drupal site and deployment:

- an external issuer and subject MUST have at most one active Drupal-account
  mapping; and
- a Drupal account MUST have at most one active external issuer and subject
  mapping.

There MUST be at most one active logical connection and delegation for an exact
target tuple. Concurrent or overlapping attempts MUST NOT weaken either
uniqueness rule.

A replacement that changes either side of the mapping MUST produce one
authoritative outcome that preserves both uniqueness rules. If the caller lacks
authority to retire every exact conflicting mapping, the replacement MUST fail
without partially switching identities.

## Visibility, review, and revocation

The person MUST be able to see that the managed connection exists, identify the
Drupal account, site, and deployment it targets, review its effective policy
and availability state, and reach its revoke path.

An authorized Drupal administrator MUST be able to inspect the exact connection
and its reason-coded state, revoke it, remove eligibility, disable the managed
integration or client, and distinguish connection health from optional-provider
health without viewing credential material.

When Drupal's active access policy gives the connected account unrestricted
authority, person confirmation and authorized administration MUST identify the
connection as unrestricted. Site or profile policy MAY prohibit it.

Routine credential maintenance SHOULD remain invisible. Reconnection SHOULD be
reserved for an authority-ending outcome or genuinely irrecoverable connection
state.

## Baseline exclusions

This profile does not define:

- administrator-created or batch-provisioned personal connections;
- directory-driven identity-to-account mapping;
- unattended, scheduled, service-account, or shared-account authority;
- a customer-configured scope or capability permission model;
- a required capability transport or tool catalog; or
- exact lifecycle state names, wire outcomes, schemas, routes, callbacks,
  signatures, token claims, encryption envelopes, or error payloads.

A future administrator-provisioned profile may establish connections without
person action only after separate review defines authoritative mapping input,
delegating authority, notice, suppression after personal revocation,
independent per-site outcomes, and individual review and revocation. That
future profile is not part of this baseline or its conformance claim.

## Interface and interoperability companions

Exact wire behavior belongs to versioned companion specifications:

- [`INTEROP-PROFILE.md`](INTEROP-PROFILE.md) for selected OAuth, metadata, discovery, client, and
  dependency-version behavior;
- an API or runtime interface specification for exact establishment, current-
  sender, lifecycle, reconciliation, context, inventory, and error schemas;
- [`CONFORMANCE.md`](CONFORMANCE.md) for executable profile cases and evidence requirements;
  and
- named capability profiles for optional provider behavior.

Until those companions exist and an implementation passes the applicable
suite, this document is a proposed behavioral profile rather than an
interoperability or implementation-readiness claim.
