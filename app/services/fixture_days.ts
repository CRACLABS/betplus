import Fixture from '#models/fixture'
import FixtureDay from '#models/fixture_day'
import LogoStore from '#services/logo_store'
import StatsHubClient, { type StatsHubFixture } from '#services/statshub_client'
import { DateTime } from 'luxon'

/**
 * How far from today the Événements page can browse (and fetch) days.
 */
export const BROWSE_RANGE_DAYS = 7

/**
 * Fixtures are kept per day. A day is fetched from StatsHub (1 Parse credit)
 * the first time someone opens it, and once more after its matches are over
 * so the final scores land. Today is otherwise refreshed by
 * `node ace statshub:sync-fixtures`. So each day costs at most 2 credits.
 */
export default class FixtureDays {
  constructor(private client: Pick<StatsHubClient, 'fixturesByDate'> = new StatsHubClient()) {}

  static today() {
    return DateTime.utc().startOf('day')
  }

  static inRange(date: DateTime, today = FixtureDays.today()) {
    return Math.abs(date.diff(today, 'days').days) <= BROWSE_RANGE_DAYS
  }

  /**
   * Whether `date` must be (re)fetched: never fetched, or last fetched
   * before its matches were over (end of day + 3h) and that time has passed.
   */
  static needsFetch(day: FixtureDay | null, date: DateTime, now = DateTime.utc()) {
    if (!day) return true
    const settled = date.endOf('day').plus({ hours: 3 })
    return now > settled && day.fetchedAt < settled
  }

  /**
   * Make sure the fixtures of `date` are in the database.
   */
  async ensure(date: DateTime): Promise<'cached' | 'fetched' | 'out-of-range' | 'error'> {
    if (!FixtureDays.inRange(date)) return 'out-of-range'
    const day = (await FixtureDay.findBy('date', date.toISODate()!)) ?? (await this.adopt(date))
    if (!FixtureDays.needsFetch(day, date)) return 'cached'

    try {
      const response = await this.client.fixturesByDate(date.toISODate()!)
      await FixtureDays.store(date.toISODate()!, response.fixtures ?? [])
    } catch {
      return 'error'
    }

    // Logos of new teams download in the background; pages show initials meanwhile.
    const fixtures = await Fixture.query().where('match_date', date.toISODate()!)
    new LogoStore().downloadFor(fixtures).catch(() => {})
    return 'fetched'
  }

  /**
   * Days synced before fixture_days existed: record them from their fixtures
   * instead of spending a credit again.
   */
  private async adopt(date: DateTime) {
    const latest = await Fixture.query()
      .where('match_date', date.toISODate()!)
      .orderBy('updated_at', 'desc')
      .first()
    if (!latest?.updatedAt) return null
    const count = await Fixture.query().where('match_date', date.toISODate()!).count('* as total')
    return FixtureDay.create({
      date,
      fixturesCount: Number(count[0].$extras.total),
      fetchedAt: latest.updatedAt,
    })
  }

  /**
   * Save one day of API fixtures and remember that the day was fetched.
   * Returns the fixtures that were kept.
   */
  static async store(date: string, fixtures: StatsHubFixture[]) {
    const valid = fixtures.filter(
      (fixture) => fixture.event_id && fixture.home_team && fixture.away_team
    )
    for (const fixture of valid) {
      await Fixture.upsertFromApi(fixture, date)
    }
    await FixtureDay.updateOrCreate(
      { date: DateTime.fromISO(date, { zone: 'utc' }) },
      { fixturesCount: valid.length, fetchedAt: DateTime.utc() }
    )
    return valid
  }
}
