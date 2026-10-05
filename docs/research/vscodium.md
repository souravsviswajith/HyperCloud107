# VSCodium — 107 / 0-Facing Development Surface

**Status:** Reference / architectural decision  
**Research loop:** Observe → Formalize → Transform → Verify  
**Scope:** VSCodium is an interface and development surface for the 107 system. It is not part of the Cloud107 execution authority.

## 1. Observation

VSCodium is a community build system for producing freely licensed binaries of Microsoft's VS Code source with a community configuration. Its repository contains build, packaging, release, and platform workflow scripts.

Reference: https://github.com/VSCodium/vscodium

VSCodium currently supports Windows, Linux, and macOS targets and uses Open VSX as its default extension registry because Microsoft Marketplace terms are tied to Visual Studio products.

## 2. 107 interpretation

The 107 model places the user at boundary **0**:

\[
0 \rightarrow S_0 \rightarrow S_1 \rightarrow S_2 \rightarrow S_3 \rightarrow S_4 \rightarrow O_t \rightarrow I_{t+1}
\]

VSCodium belongs at the **0-facing interface layer**.

It captures developer intent and exposes execution state, but it does not become the semantic authority, scheduler, hypervisor, or canonical state store.

## 3. Architectural position

\[
\boxed{
0 \rightarrow \text{VSCodium} \rightarrow S_0/S_1 \rightarrow \text{Cloud107} \rightarrow S_2 \rightarrow S_3 \rightarrow S_4
}
\]

The execution side may then select:

- native process execution
- container execution
- microVM
- full virtual machine
- remote node
- mobile/edge node

The choice is an execution-planning decision, not a VSCodium decision.

## 4. Hypervisor boundary

Hypervisor/VMM technology remains below the Cloud107 execution layer:

\[
\text{VSCodium}
\rightarrow
\text{Cloud107 execution model}
\rightarrow
\text{VM/VMM}
\rightarrow
\text{hypervisor}
\rightarrow
\text{host hardware}
\]

Therefore:

- VSCodium is not Hypervisor107.
- Hypervisor107 is not an editor extension.
- An editor extension may request a capability, but Cloud107 remains authoritative for capability resolution, planning, allocation, and execution.

## 5. Integration principle

A future 107/VSCodium integration should use a thin adapter rather than embedding Cloud107 semantics throughout the editor.

Conceptually:

\[
Intent_{0}
\xrightarrow{Adapter}
S_0
\xrightarrow{Cloud107}
S_1/S_2/S_3/S_4
\]

The adapter may expose:

- workload submission
- capability discovery
- node selection information
- execution status
- logs
- artifacts
- diagnostics
- cancellation
- reconnect/recovery state

It must not independently decide authoritative placement or bypass the Cloud107 execution path.

## 6. Security boundary

The editor is an untrusted or semi-trusted client surface relative to the execution authority.

Credentials, authorization, node identity, binding validity, and execution policy must therefore remain outside the editor's authority.

The existing binding model requires live read-time validation:

\[
Runnable(CID_E) \equiv \exists B:Live(B)
\]

VSCodium should consume this state rather than reproduce or cache the binding rules.

## 7. Research conclusion

**Adopt:** VSCodium as a reference implementation for the developer-facing editor surface.

**Do not adopt:** VSCodium as a replacement for Cloud107, Hypervisor107, the scheduler, capability registry, or execution model.

**Next implementation boundary:**

\[
0 \rightarrow VSCodium\ adapter \rightarrow Cloud107\ API
\]

with Hypervisor107 remaining below the Cloud107 execution/control plane.

This preserves the unified 107 model and prevents the editor from becoming an accidental second control plane.
