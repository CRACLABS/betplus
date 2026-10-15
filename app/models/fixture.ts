import { FixtureSchema } from '#database/schema'
import type { StatsHubFixture } from '#services/statshub_client'
import { DateTime } from 'luxon'

/**
 * A football match pulled from the StatsHub API (see `node ace statshub:sync-fixtures`).
 */
export default class Fixture extends FixtureSchema {
  /**
   * Map one item of get_fixtures_by_date's `fixtures` array to our columns.
   */
  static attributesFromApi(fixture: StatsHubFixture, date: string) {
    return {
      eventId: fixture.event_id,
      matchDate: DateTime.fromISO(date, { zone: 'utc' }),
      startsAt: fixture.start_timestamp
        ? DateTime.fromSeconds(fixture.start_timestamp, { zone: 'utc' })
        : null,
      status: fixture.status ?? null,
      country: fixture.country ?? null,
      tournamentId: fixture.tournament?.id ?? null,
      tournamentName: fixture.tournament?.name ?? null,
      round: fixture.round !== undefined && fixture.round !== null ? String(fixture.round) : null,
      homeTeamId: fixture.home_team.id,
      homeTeamName: fixture.home_team.name,
      awayTeamId: fixture.away_team.id,
      awayTeamName: fixture.away_team.name,
      homeScore: fixture.home_score ?? null,
      awayScore: fixture.away_score ?? null,
      winnerCode: fixture.winner_code ?? null,
      payload: fixture,
    }
  }

  static upsertFromApi(fixture: StatsHubFixture, date: string) {
    return this.updateOrCreate({ eventId: fixture.event_id }, this.attributesFromApi(fixture, date))
  }

  get hasScore() {
    return this.homeScore !== null && this.awayScore !== null
  }

  get isLive() {
    return this.status === 'inprogress'
  }

  get isFinished() {
    return this.status === 'finished'
  }

}
