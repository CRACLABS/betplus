/**
 * Display preferences a member can change in Paramètres > Préférences.
 * Stored as JSON on users.preferences; missing keys fall back to these defaults.
 */
export const PREFERENCE_OPTIONS = {
  theme: { dark: 'Sombre', light: 'Clair', system: 'Comme mon appareil' },
  accent: { vert: 'Vert', bleu: 'Bleu', violet: 'Violet', orange: 'Orange', rose: 'Rose' },
  font: { sora: 'Sora (par défaut)', systeme: 'Police du système', lisible: 'Très lisible' },
  textSize: { normal: 'Normale', grand: 'Grande', tres_grand: 'Très grande' },
  language: { fr: 'Français', en: 'English (bientôt)' },
  oddsFormat: {
    decimal: 'Décimale (2.40)',
    fractional: 'Fractionnelle (7/5)',
    american: 'Américaine (+140)',
  },
  timezone: {
    'Europe/Paris': 'Paris (France, Belgique, Suisse)',
    'Africa/Lagos': 'Afrique de l’Ouest et centrale (Cotonou, Douala, Lagos)',
    'Africa/Abidjan': 'Abidjan, Dakar, Lomé (GMT)',
    'America/Montreal': 'Montréal',
    'UTC': 'UTC',
  },
} as const

export type Preferences = {
  [K in keyof typeof PREFERENCE_OPTIONS]: keyof (typeof PREFERENCE_OPTIONS)[K]
} & { reduceMotion: boolean }

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  accent: 'vert',
  font: 'sora',
  textSize: 'normal',
  language: 'fr',
  oddsFormat: 'decimal',
  timezone: 'Europe/Paris',
  reduceMotion: false,
}

export function resolvePreferences(saved: Partial<Preferences> | null | undefined): Preferences {
  const prefs = { ...DEFAULT_PREFERENCES }
  for (const key of Object.keys(PREFERENCE_OPTIONS) as (keyof typeof PREFERENCE_OPTIONS)[]) {
    const value = saved?.[key]
    if (value && value in PREFERENCE_OPTIONS[key]) (prefs as any)[key] = value
  }
  prefs.reduceMotion = saved?.reduceMotion === true
  return prefs
}

/**
 * Show decimal odds (e.g. "2.40") in the member's chosen format.
 */
export function formatOdds(
  decimal: number | string,
  format: Preferences['oddsFormat'] = 'decimal'
) {
  const value = Number(decimal)
  if (!Number.isFinite(value) || value <= 1) return String(decimal)
  if (format === 'american') {
    return value >= 2 ? `+${Math.round((value - 1) * 100)}` : `${Math.round(-100 / (value - 1))}`
  }
  if (format === 'fractional') {
    const profit = value - 1
    // Closest simple fraction with a denominator up to 20.
    let best = { n: Math.round(profit), d: 1 }
    for (let d = 1; d <= 20; d++) {
      const n = Math.round(profit * d)
      if (Math.abs(n / d - profit) < Math.abs(best.n / best.d - profit) - 1e-9) best = { n, d }
    }
    return `${best.n}/${best.d}`
  }
  return value.toFixed(2)
}
