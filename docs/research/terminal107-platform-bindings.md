# Terminal107 Platform Binding Research

## Question

Which Android execution substrate should Terminal107 use?

## Observation

Android can expose multiple execution environments: a native Linux development environment backed by Android virtualization infrastructure on supported devices; Termux-based userspace environments; and direct Android shell.

These are execution substrates, not semantic terminal identities.

## Formalization

Terminal107 requires: Terminal107 → PlatformBinding → Runtime

The binding must report its capabilities and constraints to the Cloud107 allocation model.

## Comparison

| Binding | Isolation | Linux compatibility | Availability | Role |
|---|---|---|---|---|
| Android AVF Linux VM | VM | High | Device-dependent | Preferred |
| Termux | Userspace | High for many workloads | Broad | Compatibility |
| Android shell | OS shell | Low | Broad | Minimal fallback |

## Decision

Do not hard-code Termux as the Android architecture.

Use PlatformBinding with android-avf-vm, termux and android-shell implementations.

The resolver selects the strongest supported binding.

## 107 mapping

0 → Terminal107 → S₀ → S₁ → Capability/platform resolution → S₂ → S₃ → selected runtime → S₄ → Oₜ → Terminal107 → 0

## Verification criteria

A binding should be evaluated for architecture, isolation, filesystem capabilities, process lifecycle, networking, persistence, background execution, c107 availability, Cloud107 node connectivity, workload compatibility and resource reporting.

## Research LOOP conclusion

The preferred Android architecture is a substrate-neutral Terminal107 binding layer, with AVF VM as the preferred implementation where supported and Termux retained as a compatibility implementation.

This keeps platform details below S₁ and preserves Cloud107 as the authoritative execution layer.