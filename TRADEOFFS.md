# TRADEOFFS

Decisions an interviewer can attack. Each one has a why-not.

## Local-first ledger vs Postgres from day one

**Chose:** event log in `localStorage`, fold in the client.
**Not:** a hosted database as source of truth.

Personal growth data is more sensitive than a public social graph and less operationally demanding than a bank. A server-owned store would force auth, backups, and a privacy policy before the interesting algorithms existed. The engine is persistence-agnostic: `ChainEntry[]` in, `Projection` out. Swapping the adapter to SQLite/CRDT sync is an afternoon; putting Postgres in the reducer would have coupled the claim to a vendor.

Cost: no multi-device sync, quota limits, extractable keys beside the log. Acceptable for a single-player desk. Wrong for a company.

## Hash chain + Merkle receipts vs a public blockchain

**Chose:** SHA-256 hash chain, RFC 6962 Merkle tree, device signatures.
**Not:** Ethereum, a token, or "put the habits on-chain."

A blockchain solves **public consensus among mutually distrusting writers**. This product has one writer (you) and occasional verifiers (an interviewer, a future employer, yourself in six months). Publishing PII-adjacent events to a global replicated log would be malpractice. The cryptographic *primitives* are the same ones ledgers use. The network is not.

If we needed timestamping against the device clock, the next step is **external anchoring**: periodically publish the Merkle root (32 bytes, no titles) to a public timestamp service or a cheap L2. That is an optional layer-3, not the data model.

## Canonical integer JSON vs protobuf/CBOR

**Chose:** deterministically encoded JSON, integers only.
**Not:** a binary codec.

Recruiters will read the code. JSON they can audit in a gist. Floats are banned because `1.1` is not stable across languages. Receipts stay human-inspectable. The failure mode is size, not ambiguity. If the log hits tens of thousands of events, snapshot the projection every N entries and length-prefix a binary frame — without changing hashes of historical events.

## Extractable JWK in localStorage vs non-extractable IndexedDB keys

**Chose:** extractable Web Crypto keys so the demo survives refresh and tests can round-trip.
**Not:** the production key ceremony.

Correct hardening: `generateKey(..., extractable: false)`, persist `CryptoKey` in IndexedDB, never `JSON.stringify` the private JWK. XSS then cannot exfiltrate the key (it can still *use* it). Documenting the gap is better than pretending a portfolio demo is an HSM.

## Half-Kelly vs greedy priority sort

**Chose:** Laplace-smoothed hit rate, priority-as-odds, 50% Kelly, basis points.
**Not:** "sort by due date."

Full Kelly on noisy Bernoulli data over-bets. Desks haircut. Basis points keep the receipt integer-canonical. Greedy priority ignores empirical yield — people are calibrated on what they *say* matters, not what they finish. Kelly without the DAG would recommend blocked work; the allocator treats topology as a hard filter and Kelly as a weight on the feasible set.

## Thompson sampling vs ε-greedy vs UCB1

**Chose:** Thompson (sample from Beta posterior).
**Not:** ε-greedy (arbitrary ε) or UCB1 (needs a well-defined time index per pull).

Personal "pulls" are irregular. Thompson degrades to the mean as data arrives and still explores when posteriors overlap. ε-greedy would need a story for ε. UCB1 would need a cleaner notion of a trial. Inverse-transform Gamma sampling is implemented in-repo so there is no library to hide behind.

## Kaplan–Meier vs a raw average completion time

**Chose:** product-limit estimator with right-censoring.
**Not:** `mean(completedAt - createdAt)` over finished goals.

Averages on completed work are biased toward fast wins. Open goals are information: they have *survived* this long. KM is the standard answer in biostats and credit risk. Competing risks (abandon vs complete) are **not** modeled yet; treating abandonments as censored is conservative for "time to done" and would be the first extension (Fine–Gray).

## Skip-illegal in the reducer vs crash-the-fold

**Chose:** drop unknown types, duplicate creates, and completes of missing ids.
**Not:** throw, which would freeze the UI on a single hostile or corrupt event.

The chain still contains the bad entry (integrity ≠ validity). The projection is a *view*. Rebuilding after a schema change is the point of event sourcing. Commands still validate on write so the happy path does not spam junk.

## Gemini as annotation vs Gemini as planner

**Chose:** the model writes `insight.recorded` events. The allocator does not call the model.
**Not:** "an agent that decides your day."

LLM planners are non-deterministic, hard to test, and easy to cargo-cult. An interviewer can ask "what happens when the API is down?" The answer here is: the desk still ranks, the chain still verifies, Biscuit goes quiet. Rate limits and payload caps sit on the only network egress besides optional verify.

## In-memory token bucket vs Redis

**Chose:** per-isolate bucket.
**Not:** distributed limiter.

Honest: serverless isolates do not share memory. This stops a single tab from igniting the model bill. It does not stop a distributed flood. On a real deploy, put the platform limiter (Vercel/Cloudflare) or Redis in front and keep this as defense in depth.

## What I would do next (in order)

1. Non-extractable IndexedDB identity + encrypted backup phrase.
2. Projection snapshots every 256 events.
3. CRDT or op-based sync with the hash chain as the audit log (chain is not the sync primitive).
4. External Merkle anchoring.
5. Competing-risk survival and calibrated bandit diagnostics (Brier score on domain posteriors).
6. Replace localStorage with OPFS or SQLite/WASM when the log outgrows the quota.
