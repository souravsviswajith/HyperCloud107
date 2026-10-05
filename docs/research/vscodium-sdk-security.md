# VSCodium / 107 SDK, Libraries and Node Hooks

**Status:** Preconfigured baseline

## Architecture

VSCodium is the 0-facing development surface. The SDK is a thin adapter over Cloud107; it does not become the execution authority.

0 -> VSCodium -> SDK -> S0/S1 -> Cloud107 -> S2/S3/S4 -> execution node

## Preconfigured components

- `src/sdk/` — public SDK surface.
- `src/security/` — security policy, event evaluation, node hook, and provider reporting.
- `SecurityNodeHook` — observes node-action failures and evaluates the default policy.
- `HttpSaaSProviderReporter` — provider-neutral HTTPS reporting adapter.

## Security lifecycle

VSCodium / SDK
-> Node Hook
-> Security Policy
-> allow / flag / block / ban / report
-> optional SaaS Provider Reporter

## Default policy

- Enabled.
- Fail closed for critical auto-ban decisions.
- Medium/high/critical events are flaggable.
- High/critical events are reportable.
- Critical events are auto-ban candidates.

These are edge defaults. Cloud107 remains authoritative for identity, authorization, binding validity, scheduling, execution and durable security state.

## Review, flag, ban and report

Security events are structured with event ID, timestamp, subject, node, source, action, severity and reason.

The SaaS reporter is intentionally provider-neutral. A deployment supplies its endpoint and credential at runtime. No SaaS vendor or credential is embedded in source.

A report means forwarding a structured security event to the configured provider. It does not imply that the provider's response changes Cloud107 authorization automatically. Provider responses must be reconciled through the authoritative Cloud107 security/control plane.

## Libraries

The SDK should remain small and dependency-light:

- security policy types and evaluator
- SaaS reporting interface and HTTPS implementation
- node-hook interface
- default node-hook factory
- future capability/client helpers only when an existing Cloud107 contract requires them

Do not duplicate scheduler, capability registry, workload planner, binding validation or hypervisor logic in the SDK.

## Node hooks

Node hooks are interception points around node-side actions. They can observe failures and emit security events.

They are not a substitute for server-side authorization. The authoritative execution path remains Cloud107.

## Preconfiguration contract

The VSCodium integration should ship with the SDK and hooks available, but external provider reporting remains disabled until an endpoint/credential is explicitly configured.

This avoids accidental data exfiltration while keeping the security workflow ready for deployment.

## Research conclusion

Adopt the SDK and node-hook abstraction as the reusable 0-facing integration layer.

Do not hard-code a SaaS provider, credentials, moderation policy owned by an external service, or an alternative execution control plane.
