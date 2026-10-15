import type { HttpContext } from '@adonisjs/core/http'

/**
 * The signed-in user's own profile page (/moi).
 * Stats are demo values until pronostics are stored.
 */
export default class AccountController {
  async show({ view, auth }: HttpContext) {
    const user = auth.user!
    return view.render('pages/moi', {
      user,
      stats: { credits: '3 400', followers: 155, following: 42, winRate: '68%' },
    })
  }
}
