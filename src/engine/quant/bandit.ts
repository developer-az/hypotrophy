/**
 * Thompson sampling for Bernoulli bandits (Beta-Bernoulli conjugate).
 *
 * Each arm (a life domain) has a Beta(α, β) posterior:
 *   α = 1 + successes
 *   β = 1 + failures
 * Prior Beta(1,1) is uniform — we do not pretend to know the user.
 *
 * To pick an arm, sample θ ~ Beta(α, β) and take argmax. That is the
 * posterior probability that this domain is currently the highest-yield
 * use of the next unit of attention.
 *
 * We sample via inverse-transform on a Gamma(α,1) / (Gamma(α,1)+Gamma(β,1))
 * representation. Marsaglia-Tsang for Gamma(shape ≥ 1), Ahrens-Dieter
 * boost for shape < 1.
 */

export interface BanditArm {
  id: string
  alpha: number
  beta: number
}

export interface BanditSample {
  id: string
  theta: number
  mean: number
}

export function posteriorMean(arm: BanditArm): number {
  return arm.alpha / (arm.alpha + arm.beta)
}

export function sampleArm(arm: BanditArm, rng: () => number): number {
  const x = sampleGamma(arm.alpha, rng)
  const y = sampleGamma(arm.beta, rng)
  const s = x + y
  return s === 0 ? 0.5 : x / s
}

export function thompsonSelect(arms: BanditArm[], rng: () => number): BanditSample[] {
  return arms
    .map((arm) => ({
      id: arm.id,
      theta: sampleArm(arm, rng),
      mean: posteriorMean(arm),
    }))
    .sort((a, b) => b.theta - a.theta)
}

/**
 * Marsaglia and Tsang (2000), "A Simple Method for Generating Gamma Variables".
 * For 0 < shape < 1 we use ξ = Gamma(shape+1) * U^{1/shape}.
 */
export function sampleGamma(shape: number, rng: () => number): number {
  if (shape <= 0) return 0
  if (shape < 1) {
    const u = Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, rng()))
    return sampleGamma(shape + 1, rng) * u ** (1 / shape)
  }

  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  for (;;) {
    let x = 0
    let v = 0
    do {
      x = sampleNormal(rng)
      v = 1 + c * x
    } while (v <= 0)
    v = v * v * v
    const u = rng()
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
}

/** Box-Muller. */
export function sampleNormal(rng: () => number): number {
  const u1 = Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, rng()))
  const u2 = rng()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
