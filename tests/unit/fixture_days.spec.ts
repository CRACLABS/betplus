import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import FixtureDays from '#services/fixture_days'

test.group('FixtureDays', () => {
  test('only browses a week around today', ({ assert }) => {
    const today = DateTime.fromISO('2026-10-15', { zone: 'utc' }) as DateTime<true>
    assert.isTrue(FixtureDays.inRange(today.plus({ days: 7 }), today))
    assert.isTrue(FixtureDays.inRange(today.minus({ days: 7 }), today))
    assert.isFalse(FixtureDays.inRange(today.plus({ days: 8 }), today))
  })
})
