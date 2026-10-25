# Hypotrophy: product and design principles

## Product
Hypotrophy is a thoughtful personal-growth companion. Help people make small, self-directed promises, keep track of them without shame, and notice their progress. Biscuit is a real, friendly hamster companion—not an excuse for a novelty-dashboard aesthetic. Existing goal creation, prioritization, completion, deletion, AI insights, progress analysis, and local-storage behavior are product features; preserve them when changing the UI.

## Design direction
Design the product as an independent, editorial personal-growth journal: warm off-white paper, soft ink, muted olive, and restrained brick-red actions; a distinctive, beautiful serif headline against discreet, legible sans-serif utility text; quiet alignment, generous whitespace, fine separators, small labels, and intentional asymmetry. Present a connected, calm narrative from intention to practice to reflection. Make Biscuit's actual mascot a warm, personable detail.

The feeling should be composed, human, quietly encouraging, and unusually considered—not a gamified task dashboard, fitness tracker, generic SaaS admin, startup landing page, or AI-generated component checklist. Prefer clear purpose over chrome. Use motion only to communicate feedback; honor reduced-motion settings. The UI is mobile-first, keyboard-accessible, semantic, high-contrast, and genuinely usable at every supported width.

## Implementation
- Inspect and extend the existing Next.js App Router, React, TypeScript, and Tailwind CSS v4 architecture. Do not add dependencies just for icons, animation, or UI primitives; inline SVG and CSS are sufficient.
- Keep the interface functional, not merely illustrative. Preserve local storage, task actions, AI requests and loading states. Empty, hydration, active, completed, and error states must feel intentionally designed.
- Keep styles consistent through the tokens in `src/app/globals.css`; responsive layouts must not overflow or hide key controls. Label form controls and icon-only controls, and communicate selected states semantically.
- Choose details for this particular product and moment instead of applying familiar dashboard patterns by default. Quality means considered typography, restrained color, legibility, accurate interaction feedback, and visual consistency—not maximum ornament.
- After frontend changes, run the available build and lint/type checks. If dependencies or a browser are unavailable, state this explicitly rather than claiming tests passed.