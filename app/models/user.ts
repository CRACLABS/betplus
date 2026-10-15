import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { PREFERENCE_OPTIONS, resolvePreferences } from '#services/preferences'

/**
 * User model represents a user in the application.
 * It extends UserSchema and includes authentication capabilities
 * through the withAuthFinder mixin.
 */
export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  /**
   * Get the user's initials from their full name or email.
   * Returns the first letter of first and last name if available,
   * otherwise returns the first two characters of the email username.
   */
  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }

  /**
   * Public @handle: the chosen username, or the email name until one is set.
   */
  get handle() {
    return (
      this.username ??
      this.email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
    )
  }

  get displayName() {
    return this.fullName || this.handle
  }

  get roleLabel() {
    return this.role === 'tipster' ? 'Pronostiqueur' : 'Parieur'
  }

  /**
   * Display preferences with defaults filled in (Paramètres > Préférences).
   */
  get prefs() {
    return resolvePreferences(this.preferences)
  }

  get timezoneLabel() {
    return PREFERENCE_OPTIONS.timezone[this.prefs.timezone].split(' (')[0]
  }
}
