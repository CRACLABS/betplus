import { FixtureSchema } from '#database/schema'
import LogoStore from '#services/logo_store'
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

  /**
   * Kick-off time shown to users, in French time.
   */
  get kickoff() {
    return this.kickoffIn('Europe/Paris')
  }

  /**
   * Kick-off time in the member's time zone (Paramètres > Préférences).
   */
  kickoffIn(timezone: string) {
    return this.startsAt ? this.startsAt.setZone(timezone).toFormat('HH:mm') : null
  }

  get statusLabel() {
    if (this.isLive) return 'En direct'
    if (this.isFinished) return 'Terminé'
    if (this.status === 'postponed') return 'Reporté'
    return 'À venir'
  }

  /**
   * Losing side of a finished match, to dim it (winner_code is not reliable).
   */
  get homeLost() {
    return this.isFinished && this.hasScore && this.homeScore! < this.awayScore!
  }

  get awayLost() {
    return this.isFinished && this.hasScore && this.awayScore! < this.homeScore!
  }

  /**
   * Competition id used for logos (the "unique" tournament, e.g. MLS = 242).
   */
  get uniqueTournamentId(): number | null {
    return this.payload?.tournament?.unique_id ?? this.tournamentId ?? null
  }

  get homeLogo() {
    return LogoStore.url('teams', this.homeTeamId)
  }

  get awayLogo() {
    return LogoStore.url('teams', this.awayTeamId)
  }

  get tournamentLogo() {
    return LogoStore.url('tournaments', this.uniqueTournamentId)
  }
}
