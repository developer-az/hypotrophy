import type { Goal } from '../domain/types'

/**
 * Kaplan–Meier product-limit estimator for time-to-completion.
 *
 * Each goal is an observation:
 *   completed  → event at (completedAt − createdAt)
 *   abandoned  → censored at (abandonedAt − createdAt)
 *   still open → censored at (now − createdAt)
 *
 * S(t) = Π_{t_i ≤ t} (1 − d_i / n_i)
 *
 * This is the same estimator used in biostats and credit-risk survival
 * models. Applied here it answers: "given how this person actually
 * finishes work, what fraction of goals are still open after t days?"
 */

export interface SurvivalPoint {
  t: number
  atRisk: number
  events: number
  survival: number
}

export interface SurvivalCurve {
  points: SurvivalPoint[]
  n: number
  events: number
  censored: number
}

interface Observation {
  time: number
  event: boolean
}

export function observations(goals: Goal[], now: number): Observation[] {
  return goals
    .map((g) => {
      if (g.status === 'completed' && g.completedAt != null) {
        return { time: Math.max(0, g.completedAt - g.createdAt), event: true }
      }
      if (g.status === 'abandoned' && g.abandonedAt != null) {
        return { time: Math.max(0, g.abandonedAt - g.createdAt), event: false }
      }
      return { time: Math.max(0, now - g.createdAt), event: false }
    })
    .filter((o) => Number.isFinite(o.time))
}

export function kaplanMeier(goals: Goal[], now: number): SurvivalCurve {
  const obs = observations(goals, now).sort((a, b) => a.time - b.time)
  const n0 = obs.length
  if (n0 === 0) {
    return { points: [{ t: 0, atRisk: 0, events: 0, survival: 1 }], n: 0, events: 0, censored: 0 }
  }

  const points: SurvivalPoint[] = [{ t: 0, atRisk: n0, events: 0, survival: 1 }]
  let s = 1
  let i = 0
  let events = 0
  let censored = 0

  while (i < obs.length) {
    const t = obs[i].time
    let d = 0
    let c = 0
    const atRisk = n0 - i
    while (i < obs.length && obs[i].time === t) {
      if (obs[i].event) {
        d += 1
        events += 1
      } else {
        c += 1
        censored += 1
      }
      i += 1
    }
    if (d > 0 && atRisk > 0) {
      s *= 1 - d / atRisk
    }
    points.push({ t, atRisk, events: d, survival: clamp01(s) })
    void c
  }

  return { points, n: n0, events, censored }
}

export function medianSurvival(curve: SurvivalCurve): number | null {
  for (const p of curve.points) {
    if (p.survival <= 0.5) return p.t
  }
  return null
}

export function survivalAt(curve: SurvivalCurve, t: number): number {
  let s = 1
  for (const p of curve.points) {
    if (p.t > t) break
    s = p.survival
  }
  return s
}

function clamp01(x: number): number {
  if (x < 0) return 0
  if (x > 1) return 1
  return x
}
