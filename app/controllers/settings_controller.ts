import type User from '#models/user'
import { emailValidator, passwordValidator, profileValidator } from '#validators/user'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'

const SECTIONS = ['profil', 'compte', 'securite', 'abonnement'] as const

/**
 * Paramètres: profile, account (email), security (password) and subscription.
 */
export default class SettingsController {
  async show({ view, auth, params }: HttpContext) {
    const section = SECTIONS.includes(params.section) ? params.section : 'profil'
    return view.render('pages/parametres', { user: auth.user!, section })
  }

  async updateProfile({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(profileValidator, { meta: { userId: user.id } })
    user.merge({
      fullName: payload.fullName || null,
      username: payload.username || null,
      bio: payload.bio || null,
      favoriteSport: payload.favoriteSport || null,
      role: payload.role,
    })
    await user.save()
    session.flash('success', 'Profil mis à jour')
    return response.redirect().toRoute('settings.show', { section: 'profil' })
  }

  async updateEmail({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(emailValidator, { meta: { userId: user.id } })
    if (!(await hash.verify(user.password, payload.currentPassword))) {
      wrongPassword(session, 'Mot de passe incorrect')
      return response.redirect().back()
    }
    user.email = payload.email
    await user.save()
    session.flash('success', 'Adresse email mise à jour')
    return response.redirect().toRoute('settings.show', { section: 'compte' })
  }

  async updatePassword({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(passwordValidator)
    if (!(await hash.verify(user.password, payload.currentPassword))) {
      wrongPassword(session, 'Mot de passe actuel incorrect')
      return response.redirect().back()
    }
    // The model hashes the new password on save (withAuthFinder).
    user.password = payload.password
    await user.save()
    session.flash('success', 'Mot de passe modifié')
    return response.redirect().toRoute('settings.show', { section: 'securite' })
  }

  /**
   * Premium is simulated (no payment yet), so cancelling just flips the flag.
   */
  async cancelPremium({ response, auth, session }: HttpContext) {
    const user: User = auth.user!
    user.isPremium = false
    await user.save()
    session.flash('success', 'Abonnement Premium résilié')
    return response.redirect().toRoute('settings.show', { section: 'abonnement' })
  }
}

/**
 * Show a wrong current password under its field, keeping the other inputs.
 */
function wrongPassword(session: HttpContext['session'], message: string) {
  session.flashExcept(['currentPassword', 'password', 'passwordConfirmation'])
  session.flash('inputErrorsBag', { currentPassword: [message] })
}
