import statshubConfig from '#config/statshub'
import StatshubCall from '#models/statshub_call'
import { DateTime } from 'luxon'

/**
 * Parse credits per StatsHub endpoint (from the marketplace page).
 */
export const ENDPOINT_CREDITS: Record<string, number> = {
  get_fixtures_by_date: 1,
  get_match_stats: 5,
  get_head_to_head: 5,
  get_league_standings: 1,
}

/**
 * Keeps a tally of paid StatsHub calls so pages can stop spending before the
 * monthly Parse credits run out (STATSHUB_MONTHLY_BUDGET, default 200).
 */
export default class CreditLedger {
  static async usedThisMonth() {
    const result = await StatshubCall.query()
      .where('created_at', '>=', DateTime.utc().startOf('month').toSQL()!)
      .sum('credits as total')
    return Number(result[0].$extras.total ?? 0)
  }

  static async remaining() {
    return statshubConfig.monthlyBudget - (await this.usedThisMonth())
  }

  /**
   * Whether an endpoint can still be called this month. Page views keep
   * `reserve` credits back so the daily fixtures sync never runs dry.
   */
  static async canSpend(endpoint: string, reserve = 0) {
    return (await this.remaining()) - reserve >= (ENDPOINT_CREDITS[endpoint] ?? 1)
  }

  static async record(endpoint: string) {
    await StatshubCall.create({ endpoint, credits: ENDPOINT_CREDITS[endpoint] ?? 1 })
  }
}
