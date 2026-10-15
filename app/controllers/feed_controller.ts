import Fixture from '#models/fixture'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class FeedController {
  /**
   * The home feed. Matches come from our database only: the StatsHub API is
   * called by `node ace statshub:sync-fixtures`, so page views cost no credits.
   */
  async show({ view }: HttpContext) {
    const fixtures = await Fixture.query()
      .where('match_date', DateTime.utc().toISODate()!)
      .orderBy('starts_at', 'asc')
      .limit(6)

    return view.render('pages/home', { fixtures })
  }
}
