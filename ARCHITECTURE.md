# ARCHITECTURE

Hexagonal enough to matter: the engine has no React, no Next, no `window`. UI and HTTP adapters call into it.

```
src/engine/
  crypto/     bytes, canonical JSON, SHA-256, chain, merkle, identity, receipt
  domain/     types, reducer, stats, migrate
  graph/      DAG: cycles, Kahn, longest path
  quant/      bandit, kelly, survival, allocator
  demo/       deterministic six-week fixture
  commands.ts write-side validation
  index.ts    public API
src/hooks/useEngine.ts    client orchestrator (persist, fold, allocate)
src/app/api/              health, AI (rate-limited), receipt verify (stateless)
src/app/verify/           public verifier UI
```

## Event log

```
ChainEntry {
  seq: integer
  ts: unix ms (integer)
  type: ledger.genesis | goal.* | insight.recorded
  payload: canonical object
  prevHash: hex
  hash: hex = SHA-256(canonicalize({ seq, ts, type, payload, prevHash }))
}
```

Genesis `prevHash` is 32 zero bytes. `verifyChain` checks seq, link, and hash.

## Read model

`fold(chain): Projection` is a pure left-fold. Illegal events are skipped. Delete removes a node and rewrites dependents. Completing a missing id is a no-op.

## Allocator pipeline

```
goals → buildGraph → eligible set
     → kellyPlan (bps by domain)
     → thompsonSelect (θ by domain, seeded)
     → score = θ · (0.35 + kelly) · criticalPathBoost · priority · age · feasible
     → next = max score among unblocked
```

## Receipt

Unsigned body is canonicalized and signed. Verifier checks signature, that sample proofs name the same root, and optionally recomputes the root from leaves. Stats are aggregates (counts, bps, median ms) — no titles.

## Trust boundary

| Data | Leaves the device? |
|---|---|
| Event log, titles, private JWK | No |
| AI prompt (titles you typed) | Yes, if you click Ask Biscuit |
| Receipt JSON you export | Yes, by your action |
| Merkle root + signature | Yes, if you publish a receipt |

## Testing

`npm test` runs Vitest against the engine: canonical stability, tamper detection, Merkle inclusion/forgery, reducer purity, DAG critical path and cycles, Thompson determinism, Kelly concentration, KM censoring, receipt round-trip, legacy migration.

CI (`.github/workflows/ci.yml`): test, typecheck, build.
