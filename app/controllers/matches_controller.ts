import Fixture from '#models/fixture'
import MatchStatsService, { LIVE_REFRESH_MINUTES } from '#services/match_stats'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * One match: score, status and StatsHub stats (xG, shots, players).
 */
export default class MatchesController {
  async show({ view, params, auth, response }: HttpContext) {
    const eventId = Number(params.eventId)
    const fixture = Number.isInteger(eventId) ? await Fixture.findBy('eventId', eventId) : null
    if (!fixture) return response.redirect().toRoute('events')

    const { stat, state } = await new MatchStatsService().load(fixture)
    const timezone = auth.user!.prefs.timezone

    return view.render('pages/match', {
      fixture,
      stat,
      statsState: state,
      timezone,
      refreshMinutes: LIVE_REFRESH_MINUTES,
      updatedAt: stat?.fetchedAt.setZone(timezone).toFormat('HH:mm') ?? null,
      kickoffDate:
        fixture.startsAt?.setZone(timezone).setLocale('fr').toFormat('cccc d LLLL') ?? null,
    })
  }
}
