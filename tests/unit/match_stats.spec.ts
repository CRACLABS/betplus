import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import MatchStatsService from '#services/match_stats'
import type Fixture from '#models/fixture'
import type MatchStat from '#models/match_stat'

const now = DateTime.fromISO('2026-10-15T20:00:00Z') as DateTime<true>
const fixture = (status: string) =>
  ({ status, isLive: status === 'inprogress', isFinished: status === 'finished' }) as Fixture
const stat = (minutesAgo: number, isFinal = false) =>
  ({ fetchedAt: now.minus({ minutes: minutesAgo }), isFinal }) as MatchStat

test.group('MatchStatsService.needsFetch', () => {
  test('never spends credits before kick-off', ({ assert }) => {
    assert.isFalse(MatchStatsService.needsFetch(null, fixture('notstarted'), now))
  })

  test('refreshes a live match every 15 minutes at most', ({ assert }) => {
    assert.isTrue(MatchStatsService.needsFetch(null, fixture('inprogress'), now))
    assert.isFalse(MatchStatsService.needsFetch(stat(5), fixture('inprogress'), now))
    assert.isTrue(MatchStatsService.needsFetch(stat(20), fixture('inprogress'), now))
  })

  test('fetches the final stats once, then keeps them', ({ assert }) => {
    assert.isTrue(MatchStatsService.needsFetch(stat(1), fixture('finished'), now))
    assert.isFalse(MatchStatsService.needsFetch(stat(600, true), fixture('finished'), now))
  })
})
