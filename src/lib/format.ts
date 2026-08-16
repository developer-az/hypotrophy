import type { Domain, Priority } from '@/engine'

const CATEGORY_RULES: { domain: Domain; re: RegExp }[] = [
  { domain: 'health', re: /\b(exercise|workout|gym|run|walk|diet|nutrition|sleep|health|fitness|yoga|stretch|meditate|water|vitamins|doctor|checkup)\b/i },
  { domain: 'career', re: /\b(work|job|career|resume|interview|meeting|presentation|deadline|project|client|boss|promotion|professional|linkedin|networking|ship)\b/i },
  { domain: 'learning', re: /\b(learn|study|read|course|book|tutorial|practice|research|knowledge|education|training|algorithm|proof)\b/i },
  { domain: 'finance', re: /\b(money|budget|save|invest|bank|pay|bill|expense|income|tax|insurance|loan|debt|financial|kelly)\b/i },
  { domain: 'relationships', re: /\b(friend|family|call|text|visit|date|social|party|gather|connect|relationship|love|partner)\b/i },
  { domain: 'home', re: /\b(clean|organize|decorate|repair|garden|cook|laundry|dishes|home|house|room|desk)\b/i },
  { domain: 'creativity', re: /\b(create|art|draw|paint|write|music|design|craft|creative|photo|video|blog|draft)\b/i },
]

export function detectDomain(text: string): Domain {
  for (const rule of CATEGORY_RULES) {
    if (rule.re.test(text)) return rule.domain
  }
  return 'personal'
}

export function detectPriority(text: string): Priority {
  if (/\b(urgent|asap|important|critical|deadline|emergency|today|now|immediately)\b/i.test(text)) {
    return 'high'
  }
  if (/\b(someday|eventually|maybe|when i have time|low priority|optional)\b/i.test(text)) {
    return 'low'
  }
  return 'medium'
}

export function splitTitle(input: string): { title: string; description?: string } {
  const sentences = input.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length <= 1) return { title: input.trim() }
  return {
    title: sentences[0].trim(),
    description: sentences.slice(1).join('. ').trim() || undefined,
  }
}

export const DOMAIN_META: Record<Domain, { label: string; mark: string }> = {
  personal: { label: 'Personal', mark: 'I' },
  health: { label: 'Health', mark: 'H' },
  career: { label: 'Career', mark: 'C' },
  learning: { label: 'Learning', mark: 'L' },
  relationships: { label: 'Relations', mark: 'R' },
  finance: { label: 'Finance', mark: 'F' },
  creativity: { label: 'Craft', mark: 'K' },
  home: { label: 'Habitat', mark: 'A' },
}

export function shortHash(hex: string, n = 8): string {
  if (!hex) return '—'
  return `${hex.slice(0, n)}…${hex.slice(-4)}`
}

export function formatDuration(ms: number | null): string {
  if (ms == null) return 'n/a'
  const days = ms / 86_400_000
  if (days < 1) return `${Math.max(1, Math.round(ms / 3_600_000))}h`
  if (days < 14) return `${days.toFixed(1)}d`
  return `${(days / 7).toFixed(1)}w`
}

export function bpsPct(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`
}
