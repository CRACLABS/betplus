import Fixture from '#models/fixture'
import FixtureDay from '#models/fixture_day'
import CreditLedger from '#services/credit_ledger'
import LogoStore from '#services/logo_store'
import StatsHubClient, { type StatsHubFixture } from '#services/statshub_client'
import { DateTime } from 'luxon'

/**
 * How far from today the Événements page can browse (and fetch) days.
 */
export const BROWSE_RANGE_DAYS = 7

/**
 * Fixtures are kept per day. A day is fetched from StatsHub (1 Parse credit)
 * the first time someone opens it. After that, scores only change when
 * someone presses "Actualiser" or runs `node ace statshub:sync-fixtures`.
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
   * Make sure the fixtures of `date` are in the database.
   */
  async ensure(date: DateTime): Promise<'cached' | 'fetched' | 'out-of-range' | 'error'> {
    if (!FixtureDays.inRange(date)) return 'out-of-range'
    const day = (await FixtureDay.findBy('date', date.toISODate()!)) ?? (await this.adopt(date))
    if (day) return 'cached'
    return this.refresh(date)
  }

  /**
   * Fetch `date` again (1 credit), e.g. from the "Actualiser" button.
   */
  async refresh(date: DateTime): Promise<'fetched' | 'out-of-range' | 'error'> {
    if (!FixtureDays.inRange(date)) return 'out-of-range'
    if (!(await CreditLedger.canSpend('get_fixtures_by_date'))) return 'error'
    try {
      const response = await this.client.fixturesByDate(date.toISODate()!)
      await CreditLedger.record('get_fixtures_by_date')
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
