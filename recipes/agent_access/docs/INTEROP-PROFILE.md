# Drupal Agent Access interoperability profile

> **Status:** Proposed
>
> **Profile version:** `0.1.0-draft`
>
> **Contract:** [Drupal Agent Access contract](../CONTRACT.md)
> `0.1.0-draft`
>
> **Managed profile:** [Managed personal connection profile](MANAGED-PERSONAL-PROFILE.md)
> `0.1.0-draft`
>
> **Conformance suite:** [Drupal Agent Access conformance](CONFORMANCE.md)
> `0.1.0-draft`
>
> **Implementation status:** This profile describes the proposed interoperable
> semantics for the next major, provider-neutral Agent Access foundation. The
> current experimental `1.0.x` recipe is an OAuth-and-MCP interoperability
> on-ramp and does not claim conformance with this profile.

## Purpose

This profile translates the behavioral contract into common account-bound
OAuth semantics and named runtime surfaces that independent implementations can
recognize and test.

It defines the meaning that must survive across implementations. It does not
choose PHP interfaces, Drupal service IDs, routes, endpoint paths, JSON field
names, token claims, storage entities, or cryptographic algorithms. Those belong
in versioned interface specifications and named implementation profiles.

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**,
and **MAY** are to be interpreted as described in
[BCP 14](https://www.rfc-editor.org/info/bcp14) (RFC 2119 and RFC 8174) when,
and only when, they appear
in all capitals, as shown here.

## Scope

This draft covers:

- personal account-bound OAuth delegation;
- exact Drupal-account and registered-client resolution;
- managed-client registration boundaries;
- access-credential and refresh-lineage semantics;
- revocation and recoverable credential maintenance;
- named semantic surfaces for enforcement, lifecycle, inventory, discovery,
  provenance, and conformance;
- optional capability-provider interoperability; and
- version and evidence requirements for compatibility claims.

This draft does not define unattended authority, a capability or tool catalog,
an exact managed-identity assertion, or an exact resource/audience-downscoping
profile.

## OAuth roles and trust boundaries

### Drupal deployment

For this profile, the Drupal deployment issues the account-bound OAuth
delegation and protects the Drupal application surface. It resolves the acting
Drupal account and registered client, evaluates current Drupal authorization,
and owns authoritative revocation.

The authorization server and protected resource may be components within the
same Drupal deployment. Their implementation topology does not change the
requirement that Drupal remain the authority for Drupal operations.

### Person and Drupal account

The person authenticates through a named personal or managed-personal profile.
The resulting delegation MUST bind one exact, real, loadable Drupal account. A
username, email address, organization membership, caller-supplied account ID,
or registered-client default is not sufficient proof of that binding.

### Registered client

Every delegation MUST bind one exact registered OAuth client. Client
registration identifies the application; it does not grant Drupal permissions,
prove the acting account, or prove the identity of a particular model or agent
instance.

### Optional managed connection operator

A named managed-personal profile MAY use an external operator for connection
ceremony, credential custody, renewal, reconciliation, or administration. The
operator does not become the Drupal authorization authority and MUST NOT
transfer a connection through a workspace, conversation, project, organization,
or opaque connection reference.

### Optional capability provider

A capability provider exposes content, context, or operations after the
delegation is resolved. It is not part of OAuth client registration and does not
grant or predict Drupal authority.

## Account-bound OAuth semantics

### Client registration

A registered client profile MUST declare at least its client type, exact
approved redirect locations, supported grant behavior, and required client
assurance. A client registration MUST NOT configure or rely on a fallback Drupal
account for personal delegation.

A managed personal client MUST be intentionally provisioned or explicitly
enrolled. Dynamic Client Registration MUST be absent or off by default for that
managed profile and MUST NOT be a dependency of the connection foundation. A
site MAY enable Dynamic Client Registration separately for independent clients.
Those clients do not inherit managed-client identity, lifecycle, custody, or
provenance merely because registration succeeded.

The current experimental `1.0.x` recipe may use Dynamic Client Registration as
one optional MCP interoperability path. That path is not the proposed
next-major managed-client contract.

### Personal authorization grant

The personal profile uses an OAuth authorization grant associated with the
person's exact Drupal account and exact registered client. A public-client
profile MUST use authorization code with S256 Proof Key for Code Exchange. Any
different client-assurance choice MUST be explicit in a named profile and
reviewed for that deployment.

Authorization MUST NOT silently switch to client credentials, a shared account,
an anonymous account, a system account, or a different Drupal account. An
unattended grant is a different profile and is outside this draft.

The delegation carries no frozen copy of Drupal roles or permissions. Every
protected request still resolves the account and client and runs current Drupal
authorization and validation.

### Site establishment and use policy

Drupal-owned configuration and access policy determine whether Agent Access is
enabled and which accounts and registered clients may establish or retain a
delegation. The semantic result MUST support site-wide disablement, account
eligibility, and client-specific disablement without changing unrelated OAuth
clients or Drupal permissions.

An external operator or capability provider cannot supply, override, or copy
that decision. The exact Drupal permission, policy plugin, configuration, and
administrative interface belong to an implementation specification.

### Scope and narrowing

A scope or other grant parameter MAY narrow what a generic personal client can
request. It MUST NOT add authority the connected Drupal account does not
currently hold.

A named managed-personal profile MAY intentionally use one full account-bound
delegation with no customer scope picker. If its OAuth framework requires a
non-empty default scope or marker, that value MUST be fixed by the profile,
MUST NOT be customer-configurable, MUST NOT be presented as a capability
permission, and MUST contribute no authority beyond the connected account's
current Drupal authority. The exact identifier and framework integration are
not defined here.

Enabling a capability provider MUST NOT by itself create or require another
grant or consent event. A named profile MAY define a separately established new
or narrower delegation, but that is a person-authorized connection operation
with its own lifecycle and conformance evidence; provider availability alone
MUST NOT trigger it.

### Access credentials and refresh lineage

An access token is a replaceable credential for a delegation. It is not the
logical connection. Validation MUST recover the exact Drupal account,
registered client, and applicable delegation state before application behavior
runs.

A refresh lineage MUST remain bound to the same account, client, and grant
ceiling. Refresh MUST NOT change Drupal lifecycle authority, substitute another
principal, or restore a delegation that Drupal revoked or retired.

An implementation MAY recover from an access credential rejected before its
advertised expiry. For a managed profile, recovery MUST re-read current
lifecycle and credential generation under an exact connection lease, reuse a
newer generation when one exists, perform at most one refresh for the current
generation, and promote the returned credential pair atomically. It MAY retry
the original request at most once and only when it knows that request did not
execute.

An access-credential rejection by itself MUST NOT be interpreted as person
revocation, account revocation, or loss of the logical connection.

### Revocation and browser sessions

Person revocation, authorized administrator revocation, account block or
deletion, and registered-client disablement or deletion MUST deny the next
protected request. A surviving or newly issued credential MUST NOT restore that
authority.

Ordinary Drupal browser logout, a benign account save, routine credential
rotation, or transient transport failure MUST NOT by itself revoke an otherwise
valid managed connection. A dependency combination that couples those events
must provide a reviewed, profile-scoped compatibility behavior or it does not
conform to the managed profile.

## Resource and audience status

OAuth client identity and protected-resource audience are distinct concepts.
This profile does not redefine either concept and does not claim that the
current evaluated Simple OAuth stack implements an independently selectable
resource set or RFC 8707 audience binding.

The current evaluated Simple OAuth resource/audience behavior is not, by itself,
a blocker for a managed personal profile that:

- intentionally provisions a distinct managed client;
- uses one full account-bound delegation rather than a customer-configured
  resource or scope matrix;
- enforces the exact managed connection and protected Drupal route at request
  time; and
- makes no RFC 8707 or multi-resource audience-isolation claim.

This is a bounded managed-profile posture, not proof of RFC 8707 compliance.
Distinct clients and exact route enforcement MUST NOT be described as standards-
complete resource/audience binding.

A future generic profile MAY define optional resource, audience, and scope
downscoping for independent or multi-resource clients. That profile requires its
own normative definition and conformance cases. Its absence is not a launch
blocker for the managed personal profile defined above.

## Named semantic surfaces

The names in this section identify responsibilities and observable semantics.
They are not route names, event names, Drupal service IDs, PHP interface names,
or wire identifiers.

### Principal and client resolution

The **principal and client resolution** surface derives the exact Drupal account
and exact registered client from validated request context. It either returns a
validated pair plus the applicable delegation/profile context or fails closed.

It MUST NOT accept a caller-selected account as proof, substitute a
registered-client default, or silently use anonymous, system, shared, or legacy
authentication.

### Request enforcement

The **request enforcement** surface gives protected Drupal routes and capability
providers one consistent way to require a validated delegation before
application behavior runs.

Successful resolution permits Drupal to evaluate the request; it does not
authorize the operation by itself. Current route, entity, field, revision,
translation, workflow, validation, node-access, and custom access checks remain
authoritative.

### Deferred execution

The **deferred execution** surface carries a non-secret reference to the exact
delegation, Drupal account, registered client, and intended operation when a
protected request schedules later work.

At execution time it re-resolves the binding, verifies current site, account,
client, eligibility, and delegation state, and runs current authorization and
validation for each protected operation. Cron, queue, Batch API, anonymous,
system, or worker identity MUST NOT substitute for the delegated account.
Bearer credentials and serialized authority MUST NOT be placed in deferred work
state.

### Delegation lifecycle

The **delegation lifecycle** surface establishes, inspects, revokes, and, for a
named managed profile, replaces or reconciles a delegation. Its observable
semantics MUST distinguish at least:

- a delegation that may attempt protected requests;
- credentials that require bounded maintenance while the delegation remains
  otherwise valid;
- a pending managed delegation that is barred from application data and limited
  to its exact lifecycle control, when the profile supports pending activation;
- authority that Drupal has retired and credentials cannot restore; and
- an outcome whose execution is uncertain and therefore cannot be retried as a
  mutation without exact reconciliation.

Exact state names, storage, transitions, locking, and outcome schemas belong to
the named implementation or managed profile.

### Connection inventory

The **connection inventory** surface lets a person identify their own active
delegations and an authorized site administrator enumerate every delegation
they may manage. It reports enough Drupal-controlled account, registered-client,
profile, and lifecycle state to distinguish and revoke one exact delegation,
without treating token-table rows as the sole connection record or exposing
bearer credentials.

Inventory MUST keep account, client, site, deployment, and profile identity
separable where the selected profile binds them. It MUST identify when Drupal's
active access policy gives the connected account unrestricted authority. Stale
credentials or receipts MUST NOT create an active inventory entry.

### Bounded connection context

The **bounded connection context** surface is required by a named managed-
personal profile that promises a provider-independent connection experience. It
lets the connected person inspect safe account, site or deployment, policy,
connection, capability-availability, and review/revoke context without enabling
an optional rich provider.

It MUST NOT expose credentials, email, a serialized account, raw roles, raw
permissions, protected-content counts, or a prediction that an arbitrary future
operation will be authorized.

### Capability discovery

The **capability discovery** surface returns zero or more advertised capability
profiles and the information needed to assess their enabled, compatible, and
healthy state.

An empty result is valid. A descriptor or manifest MUST NOT grant, narrow, copy,
or predict Drupal authority. Provider state MUST remain independently reasoned
from connection state.

The exact manifest schema, discovery mechanism, cache behavior, and stable
capability identifiers belong to a versioned capability/interface profile.

### Provenance

The **provenance** surface makes the resolved Drupal account and registered
client separately available to applicable audit, authorship, revision, and
operation-recording systems.

For delegation lifecycle events and attempted mutations, it emits a
site-controlled event containing a safe correlation reference, account, client,
action or target, and normalized outcome without credentials or protected
payloads. A site may retain that event in Drupal or a site-controlled external
sink. This profile does not require a durable event for every read.

It MUST describe only the assurance the implementation has. Registered-client
identity MUST NOT be promoted to proof of a particular model, agent instance, or
human origin unless a named profile supplies and validates that evidence.

### Conformance descriptor

The **conformance descriptor** identifies the contract version, this profile
version, named implementation/profile versions, Drupal and dependency versions,
optional providers, and the evidence report supporting any claim.

Its exact representation is open. A package name, module presence, or successful
installation MUST NOT substitute for the descriptor or evidence.

## Optional capability transports

The connection foundation MUST remain installable, resolvable, enforceable,
revocable, inventory-visible, and discoverable with MCP, JSON:API, Tool API, rich
content providers, operation providers, and embedded interfaces absent.

MCP MAY be selected as an interoperable rich provider. JSON:API, Tool API, or
another reviewed adapter MAY implement a named capability profile. None is
mandatory for the connection foundation, and no provider becomes qualified
merely because its transport is supported or stable.

Every enabled provider MUST:

- use the same resolved Drupal account and registered client;
- run current Drupal authorization and validation for the exact request;
- advertise only semantics that its exact implementation/version has qualified;
- fail without enabling an unreviewed fallback; and
- report capability unavailability separately from connection revocation.

Provider qualification is separate from contract and named-profile conformance.

## Current and proposed implementation lines

### Experimental `1.0.x` recipe

The current `drupal/agent_access` `1.0.x` artifact is an experimental recipe. It
assembles a Simple OAuth and MCP-oriented stack, ships no provider-neutral
runtime PHP, and documents current security and lifecycle limitations.

It remains useful for interoperability evidence and may remain as an optional
MCP overlay or on-ramp. Its package name, installation, OAuth success, or MCP
tool call does not establish conformance with the base contract or this profile.

### Proposed next-major foundation

The proposed next-major Agent Access line is a thin, provider-neutral runtime
plus a baseline account-bound OAuth recipe. It is expected to provide the named
semantic surfaces above while keeping MCP and all other capability providers
optional.

The exact module/recipe packaging, PHP interfaces, state storage, events,
endpoints, and wire schemas remain open implementation decisions. A product may
implement and prove the same semantics before a shared runtime release exists,
but it MUST identify its implementation and profile and pass the same
conformance requirements.

## Dependency compatibility and lifecycle conformance

Interoperability and lifecycle claims apply to an exact tested dependency
combination, not to a module family or version range by reputation. A report
MUST identify at least:

- Drupal core version;
- Agent Access contract, profile, runtime, and recipe versions;
- OAuth server, registered-client, and token-library versions;
- any profile-scoped compatibility layer and its version;
- enabled capability adapters and versions; and
- client implementations and client-assurance profile tested.

Every supported managed-personal combination MUST test at least:

- authorization and exact account/client binding;
- exact redirect and selected PKCE/client-assurance behavior;
- account and client isolation;
- ordinary access changes taking effect on the next request;
- explicit person and administrator revocation;
- account block and deletion;
- registered-client disablement and deletion;
- site-wide disablement and account eligibility loss;
- unrestricted-account handling with Drupal's superuser policy enabled and
  disabled;
- missing-principal and registered-client-default fallback denial;
- access-credential rejection before local expiry;
- when credential recovery is supported, one bounded refresh, concurrent
  recovery, atomic credential-pair promotion, and stale-generation protection;
- when automatic request retry after recovery is supported, at most one retry
  and only when the original request is known not to have executed;
- benign account saves and ordinary browser logout;
- lifecycle events winning over surviving or newly issued credentials;
- exact delegation inventory and site-controlled lifecycle or mutation
  provenance;
- deferred execution reauthorization when the implementation supports it;
- selected dependency upgrade behavior; and
- isolation of unrelated registered OAuth clients.

Resource/audience tests are required only for an implementation that claims a
named resource/audience profile. Passing this draft's managed-personal matrix is
not an RFC 8707 compliance result.

Capability-provider tests are required only for providers advertised as
qualified, and each advertised behavior must be tested independently of this
OAuth lifecycle matrix.

## Outcome classes

Implementations MUST preserve the semantic difference among:

- no applicable delegation;
- site disablement or account ineligibility;
- recoverable credential maintenance;
- authoritative delegation retirement or revocation;
- capability unavailable or incompatible;
- Drupal authorization denial;
- Drupal validation or workflow conflict;
- transport failure; and
- uncertain mutation outcome requiring reconciliation.

This draft does not assign wire error codes or response schemas to those
classes. A versioned interface specification must do so before independently
deployed components rely on them.

## Compatibility claims

A conformance report MUST distinguish:

- **`contract-conformant`:** the base authority and connection requirements
  pass;
- **`profile-conformant:<profile-id>`:** a named profile, such as
  `managed-personal`, passes its additional requirements; and
- **`provider-qualified:<profile-id>`:** a named capability adapter/version
  passes its own advertised behavior suite.

No draft profile, architecture proposal, package install, successful token
exchange, or single provider call is evidence of these claims.

This draft does not yet define a separately publishable interoperability-profile
claim. Such a claim requires an owned wire-interface specification and an
explicit scenario mapping in the conformance suite.

## Open interface decisions

The following remain intentionally open and MUST be finalized in the artifact
that owns them:

- exact runtime PHP interfaces and Drupal service or event names;
- authorization, token, lifecycle, inventory, context, discovery, and provenance
  endpoints or in-process APIs;
- exact request, response, state, outcome, and error schemas;
- the managed-profile scope or plumbing marker identifier;
- managed-client confidential, public, or sender-constrained assurance beyond
  the selected baseline;
- portable site and deployment identity across clone, restore, and promotion;
- authorization-server metadata and optional protected-resource discovery;
- an RFC 8707 resource/audience profile for clients that require it; and
- version negotiation and compatibility advertisement on the wire.

Leaving an interface decision open does not make the corresponding contract
behavior optional.

## Non-goals

This profile does not:

- define an OAuth server implementation;
- claim complete OAuth 2.1, MCP authorization, or RFC 8707 compliance;
- require Dynamic Client Registration for the managed client;
- require MCP or another capability provider;
- define a tool catalog or application operation;
- create a parallel permission model;
- define an unattended or service-account authority profile;
- certify the experimental `1.0.x` recipe or a Simple OAuth version by
  association; or
- replace exact interface specifications and executable conformance evidence.

## Versioning and change control

This profile is versioned independently from the Agent Access contract,
runtime, recipe, OAuth dependencies, and capability providers:

- a patch clarifies semantics without changing conformance;
- a minor version adds backward-compatible optional behavior or an optional
  named semantic surface; and
- a major version changes mandatory OAuth or interoperability semantics
  incompatibly.

This draft becomes `1.0.0` only after public review, the owned interface
specifications needed by independent implementations exist, and an executable
conformance suite proves the required semantics. Normative changes SHOULD be
reviewed with maintainers of the affected Drupal authorization, OAuth,
transport, capability, and security boundaries.
