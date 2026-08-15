# Interview script

This file is for *you*. Interviewers will not read it. They will ask you to derive it.

Senior engineers in 2026 are not impressed by "I used Next.js and Gemini." They are listening for: a real constraint, a why-not, a test that would fail if you were wrong, and whether you can modify the thing live. The points below are ordered the way a 45-minute project deep-dive actually goes.

## 30-second opener

> I took a 24-hour hackathon growth app and replaced the to-do list with an event-sourced ledger. Every action is an append-only hash-chained event. I can issue a signed Merkle receipt of the history that does not include titles. The "what should I do next" button is not the model — it is a DAG feasibility check plus Thompson sampling and half-Kelly weights over life domains. The hamster is still there. The hamster is not the claim.

If they only remember one sentence: **integrity is cryptographic, scheduling is a constraint problem, allocation is a bet.**

## Questions they will actually ask

### "Why didn't you just use a database?"

Event log is the database. The projection is a cache you can delete. I wanted time-travel, a tamper story, and a reducer I can property-test. Postgres can *store* the log later. It should not *be* the log.

### "This is basically git / a blockchain, right?"

Same primitive as git's parent hashes and a blockchain's prev-block hash: `H(payload || prev)`. Git is a DAG of snapshots; this is a single-writer chain of events plus a Merkle tree over those hashes so I can prove inclusion of one event without shipping the log. It is not a blockchain because there is no consensus, no tokens, and no public mempool of personal data.

### "Show me the Merkle proof."

RFC 6962: leaf = SHA-256(0x00 || data), node = SHA-256(0x01 || left || right). Domain separation so an interior node cannot be presented as a leaf. Odd nodes promote; they are not hashed with themselves. Proof is the sibling path, O(log n). Verifier walks leaf → root. Tests cover odd-sized trees, wrong-leaf rejection, sibling mutation, and a 2048-leaf budget.

### "Why Thompson sampling?"

Each domain is a Beta(1+wins, 1+losses) arm. If I always pick the posterior mean I starve exploration. Sampling θ ~ Beta lets a weak domain win on days when the strong one is not *that* sure. Inverse-transform via Gamma ratios, Marsaglia–Tsang, implemented in-repo. Seeded PRNG so tests are deterministic.

### "Why Kelly? This isn't a trading firm."

Kelly answers "what fraction of bankroll do I put on this bet?" Attention is the bankroll. p is smoothed completion rate, b is average open priority. Full Kelly over-bets noisy Bernoulli data, so half-Kelly, published as integer basis points so receipts stay canonical. If they push: I know the difference between edge and payoff, and I know when f* is negative (don't allocate).

### "What's the scheduler invariant?"

The DAG is a hard constraint. `dependsOn` means prerequisite. Kahn topo. Cycles are reported, not silently dropped. `next` is the highest-ranked *eligible* (unblocked) node. Critical path is longest remaining duration after topo — standard DAG DP. I can walk it on the Graph tab.

### "Kaplan–Meier on a to-do list?"

Time-to-completion with right-censoring. Averages of finished tasks ignore people who are still stuck — that bias is why survival analysis exists. Open and abandoned observations are censored for the completion curve. Median is the first t with S(t) ≤ 0.5. Known gap: competing risks (Fine–Gray) if they want a follow-up.

### "Where does the AI sit?"

Egress. Rate-limited. Caps the body. Writes `insight.recorded`. If Gemini is down, the desk still ranks. I did not let a non-deterministic model own the next-action function because I could not test it.

### "What would break in production?"

localStorage quota. Extractable keys vs XSS. Token bucket is per-isolate. No sync. Clock is the device clock (so receipts are not a trusted timestamp — anchoring is the fix). I would rather say this than claim "production-ready" and get caught.

### "Can you change X live?"

Be ready to:

- Add a new event type and a reducer branch without invalidating old hashes (new types only).
- Explain why changing canonical encoding would fork every chain (you cannot).
- Point at `verifyChain` and mutate a fixture until it fails.
- Swap half-Kelly to quarter-Kelly in `quant/kelly.ts` and say what that does to concentration.

## Behavioral STAR (same project, four angles)

**Initiative.** Hackathon shipped a companion UI. I threw away the document model because it could not support the claim I wanted to make on a résumé.

**Tradeoff.** I did *not* put this on a public chain. That's the judgment: primitives without the token.

**Failure / debug.** Canonical JSON: if key order or floats leak in, two clients disagree on a hash and receipts become theater. I banned floats and sorted keys, then hashed both insertion orders in a test.

**Conflict with "just ship."** A chat wrapper would have been faster. It would also have been indistinguishable from everyone else's Copilot weekend. The extra surface (Merkle, Kelly, KM, DAG) is there because each one answers a question the UI otherwise fakes.

## What not to say

- Do not say "I built a blockchain app."
- Do not say "AI decides the next task."
- Do not claim users or revenue you do not have. Demo ledger is synthetic; say so.
- Do not pretend localStorage is an HSM.
- Do not dump buzzwords. Derive one algorithm on the whiteboard if they ask.

## Resume fragment

Hypotrophy (Human Capital Engine) — TypeScript, Next.js  
Event-sourced local ledger with SHA-256 hash chaining and RFC 6962 Merkle receipts (Ed25519/P-256); DAG scheduler with critical path; Thompson sampling + half-Kelly allocation; Kaplan–Meier time-to-completion. Vitest on the engine including tamper detection and proof verification.
