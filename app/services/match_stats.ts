import type Fixture from '#models/fixture'
import MatchStat from '#models/match_stat'
import CreditLedger from '#services/credit_ledger'
import StatsHubClient from '#services/statshub_client'
import { DateTime } from 'luxon'

/**
 * Credits the stats button leaves untouched so the fixtures sync keeps running.
 */
export const PAGE_RESERVE = 30

export type StatsState = 'fetched' | 'not-started' | 'budget' | 'error'

/**
 * get_match_stats (5 credits) is only called when someone presses
 * "Actualiser les stats" on a match page; pages show the last saved answer.
 */
export default class MatchStatsService {
  constructor(private client: Pick<StatsHubClient, 'matchStats'> = new StatsHubClient()) {}

  load(fixture: Fixture) {
    return MatchStat.findBy('eventId', fixture.eventId)
  }

  async refresh(fixture: Fixture): Promise<StatsState> {
    if (!fixture.isLive && !fixture.isFinished) return 'not-started'
    if (!(await CreditLedger.canSpend('get_match_stats', PAGE_RESERVE))) return 'budget'

    try {
      const payload = await this.client.matchStats(fixture)
      await CreditLedger.record('get_match_stats')
      await MatchStat.updateOrCreate(
        { eventId: fixture.eventId },
        { payload, isFinal: fixture.isFinished, fetchedAt: DateTime.utc() }
      )
      return 'fetched'
    } catch {
      return 'error'
    }
  }
}
