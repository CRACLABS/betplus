import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import FixtureDays from '#services/fixture_days'
import type FixtureDay from '#models/fixture_day'

const day = (fetchedAt: string) => ({ fetchedAt: DateTime.fromISO(fetchedAt) }) as FixtureDay
const at = (iso: string) => DateTime.fromISO(iso) as DateTime<true>
const date = DateTime.fromISO('2026-10-14', { zone: 'utc' })

test.group('FixtureDays', () => {
  test('fetches a day that was never fetched', ({ assert }) => {
    assert.isTrue(FixtureDays.needsFetch(null, date))
  })

  test('refetches a past day once, after its matches are over', ({ assert }) => {
    const now = at('2026-10-15T12:00:00Z')
    assert.isTrue(FixtureDays.needsFetch(day('2026-10-14T10:00:00Z'), date, now))
    assert.isFalse(FixtureDays.needsFetch(day('2026-10-15T04:00:00Z'), date, now))
  })

  test('does not refetch a day whose matches are still running', ({ assert }) => {
    const now = at('2026-10-14T20:00:00Z')
    assert.isFalse(FixtureDays.needsFetch(day('2026-10-14T10:00:00Z'), date, now))
  })

  test('only browses a week around today', ({ assert }) => {
    const today = DateTime.fromISO('2026-10-15', { zone: 'utc' }) as DateTime<true>
    assert.isTrue(FixtureDays.inRange(today.plus({ days: 7 }), today))
    assert.isTrue(FixtureDays.inRange(today.minus({ days: 7 }), today))
    assert.isFalse(FixtureDays.inRange(today.plus({ days: 8 }), today))
  })
})
