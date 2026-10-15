import Fixture from '#models/fixture'
import MatchStatsService from '#services/match_stats'
import type { HttpContext } from '@adonisjs/core/http'

const STATS_MESSAGES = {
  'fetched': ['success', 'Statistiques mises à jour (5 crédits)'],
  'not-started': ['error', 'Le match n’a pas encore commencé'],
  'budget': ['error', 'Limite mensuelle de crédits StatsHub presque atteinte'],
  'error': ['error', 'Impossible de joindre StatsHub, réessaie plus tard'],
} as const

/**
 * One match: score, status and StatsHub stats (xG, shots, players).
 */
export default class MatchesController {
  async show({ view, params, auth, response }: HttpContext) {
    const fixture = await findFixture(params.eventId)
    if (!fixture) return response.redirect().toRoute('events')

    const stat = await new MatchStatsService().load(fixture)
    const timezone = auth.user!.prefs.timezone

    return view.render('pages/match', {
      fixture,
      stat,
      started: fixture.isLive || fixture.isFinished,
      timezone,
      updatedAt:
        stat?.fetchedAt.setZone(timezone).setLocale('fr').toFormat("d LLL 'à' HH:mm") ?? null,
      kickoffDate:
        fixture.startsAt?.setZone(timezone).setLocale('fr').toFormat('cccc d LLLL') ?? null,
    })
  }

  /**
   * "Actualiser les stats" button: one get_match_stats call (5 credits).
   */
  async refreshStats({ params, response, session }: HttpContext) {
    const fixture = await findFixture(params.eventId)
    if (!fixture) return response.redirect().toRoute('events')

    const [type, message] = STATS_MESSAGES[await new MatchStatsService().refresh(fixture)]
    session.flash(type, message)
    return response.redirect().toRoute('matches.show', { eventId: fixture.eventId })
  }
}

async function findFixture(value: string) {
  const eventId = Number(value)
  return Number.isInteger(eventId) ? Fixture.findBy('eventId', eventId) : null
}
