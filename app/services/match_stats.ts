import type Fixture from '#models/fixture'
import MatchStat from '#models/match_stat'
import CreditLedger from '#services/credit_ledger'
import StatsHubClient from '#services/statshub_client'
import { DateTime } from 'luxon'

/**
 * Minutes between two get_match_stats calls for a match still in play.
 */
export const LIVE_REFRESH_MINUTES = 15

/**
 * Credits page views leave untouched so the fixtures sync keeps running.
 */
export const PAGE_RESERVE = 30

export type StatsState = 'cached' | 'fetched' | 'not-started' | 'budget' | 'error'

/**
 * get_match_stats (5 credits) is called when someone opens a match page:
 * once when the match is over (then kept for good), and at most every
 * LIVE_REFRESH_MINUTES while it is live. Nothing is fetched before kick-off.
 */
export default class MatchStatsService {
  constructor(private client: Pick<StatsHubClient, 'matchStats'> = new StatsHubClient()) {}

  static needsFetch(stat: MatchStat | null, fixture: Fixture, now = DateTime.utc()) {
    if (!fixture.isLive && !fixture.isFinished) return false
    if (!stat) return true
    if (stat.isFinal) return false
    if (fixture.isFinished) return true
    return stat.fetchedAt < now.minus({ minutes: LIVE_REFRESH_MINUTES })
  }

  async load(fixture: Fixture): Promise<{ stat: MatchStat | null; state: StatsState }> {
    const stat = await MatchStat.findBy('eventId', fixture.eventId)
    if (!fixture.isLive && !fixture.isFinished) return { stat, state: 'not-started' }
    if (!MatchStatsService.needsFetch(stat, fixture)) return { stat, state: 'cached' }
    if (!(await CreditLedger.canSpend('get_match_stats', PAGE_RESERVE))) {
      return { stat, state: 'budget' }
    }

    try {
      const payload = await this.client.matchStats(fixture)
      await CreditLedger.record('get_match_stats')
      const saved = await MatchStat.updateOrCreate(
        { eventId: fixture.eventId },
        { payload, isFinal: fixture.isFinished, fetchedAt: DateTime.utc() }
      )
      return { stat: saved, state: 'fetched' }
    } catch {
      return { stat, state: 'error' }
    }
  }
}
