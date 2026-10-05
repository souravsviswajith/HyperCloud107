# Terminal107

Terminal107 is the terminal-facing interface layer for the 107 system.

It is not a second execution engine and it does not replace c107. It provides the user-facing terminal experience and selects a platform binding through which c107 and Cloud107 can operate.

## Boundary

0 User → Terminal107 → semantic input → S₀ → S₁ → c107 / LLM107 → Cloud107 → S₂ → S₃ → S₄ → Oₜ → Terminal107 → 0

Cloud107 remains the authoritative execution and state layer.

## Control surfaces

| Layer | Responsibility |
|---|---|
| Terminal107 | Terminal UX, input/output, presentation, platform binding |
| c107 | Stable Cloud107 command/control interface |
| LLM107 | Provider-neutral agent reasoning and planning |
| Gemini agent | Testing/validation agent implementation |
| Cloud107 | Authoritative scheduling, execution, state and resources |
| 0 | Human/user boundary |

## Platform binding

Terminal107 is substrate-neutral.

Android bindings are selected according to capabilities actually available on the device:

1. android-avf-vm — preferred isolated Linux environment where supported.
2. termux — compatibility Linux userspace binding.
3. android-shell — minimal fallback binding.

Desktop bindings can include linux-posix, wsl, windows-native and macos-native.

The binding is a platform constraint/capability. It must not leak Android-specific assumptions into the S₁ semantic workload representation.

## Android model

Terminal107 → PlatformBindingResolver → { android-avf-vm, termux, android-shell } → c107 → Cloud107

The resolver should prefer the strongest available substrate and expose the selected binding as observed execution metadata.

## Typography

Typography is a presentation concern and is independent of execution.

- Nerd Font — terminal symbols, icons and status glyphs.
- Oh My Posh — dynamic prompt composition.
- User/custom font — optional identity or user-facing presentation layer.
- Terminal monospace fallback — deterministic machine-readable output.

A custom handwriting font must not replace the Nerd Font glyph layer required for reliable terminal symbols.

## AI testing

Gemini 107 may use Terminal107/c107 as its control surface, but it is not authoritative.

Gemini → test intent → S₁ test workload → Cloud107 scheduling → selected platform binding → S₄ test execution → Oₜ evidence → Gemini analysis → 0

The agent must distinguish requested operation, accepted operation, executed operation, observed result, unavailable capability, execution failure and product/test failure.

## Research LOOP

Observe → Formalize → Transform → Verify → Execute → Compare → Measure → Refine → Repeat

The Android substrate is selected empirically from reported capabilities rather than hard-coded as a product dependency.

## Non-goals

Terminal107 must not become a parallel scheduler, maintain authoritative infrastructure state, bypass c107 verification, bypass Cloud107 authorization, make Gemini authoritative, or encode Termux-specific semantics into the core workload model.

## Status

Architecture defined. Implementation should proceed through platform-binding detection, capability reporting, c107 integration, and Gemini validation tests.