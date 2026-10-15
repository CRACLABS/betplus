import { test } from '@japa/runner'
import { formatOdds, resolvePreferences } from '#services/preferences'

test.group('Preferences', () => {
  test('formats odds in each style', ({ assert }) => {
    assert.equal(formatOdds('2.40'), '2.40')
    assert.equal(formatOdds(2.4, 'fractional'), '7/5')
    assert.equal(formatOdds(2.4, 'american'), '+140')
    assert.equal(formatOdds(1.95, 'american'), '-105')
    assert.equal(formatOdds(1.5, 'fractional'), '1/2')
  })

  test('falls back to defaults for missing or unknown values', ({ assert }) => {
    const prefs = resolvePreferences({ accent: 'bleu', theme: 'neon' as any })
    assert.equal(prefs.accent, 'bleu')
    assert.equal(prefs.theme, 'dark')
    assert.equal(prefs.timezone, 'Europe/Paris')
    assert.isFalse(prefs.reduceMotion)
  })
})
