import vine from '@vinejs/vine'
import { PREFERENCE_OPTIONS } from '#services/preferences'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  role: vine.enum(['bettor', 'tipster']).optional(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
})

/**
 * Paramètres > Profil. `userId` lets the user keep their own username.
 */
export const profileValidator = vine.withMetaData<{ userId: number }>().create({
  fullName: vine.string().trim().maxLength(80).nullable(),
  username: vine
    .string()
    .trim()
    .toLowerCase()
    .minLength(3)
    .maxLength(30)
    .regex(/^[a-z0-9_]+$/)
    .unique({
      table: 'users',
      column: 'username',
      filter: (db, _value, field) => {
        db.whereNot('id', field.meta.userId)
      },
    })
    .nullable(),
  bio: vine.string().trim().maxLength(280).nullable(),
  favoriteSport: vine.string().trim().maxLength(40).nullable(),
  role: vine.enum(['bettor', 'tipster']),
})

/**
 * Paramètres > Compte: changing the email needs the current password.
 */
export const emailValidator = vine.withMetaData<{ userId: number }>().create({
  email: email().unique({
    table: 'users',
    column: 'email',
    filter: (db, _value, field) => {
      db.whereNot('id', field.meta.userId)
    },
  }),
  currentPassword: vine.string(),
})

/**
 * Paramètres > Sécurité.
 */
export const passwordValidator = vine.create({
  currentPassword: vine.string(),
  password: password().confirmed({ confirmationField: 'passwordConfirmation' }),
})

const choice = <K extends keyof typeof PREFERENCE_OPTIONS>(key: K) =>
  vine.enum(Object.keys(PREFERENCE_OPTIONS[key]) as (keyof (typeof PREFERENCE_OPTIONS)[K])[])

/**
 * Paramètres > Préférences.
 */
export const preferencesValidator = vine.create({
  theme: choice('theme'),
  accent: choice('accent'),
  font: choice('font'),
  textSize: choice('textSize'),
  language: vine.enum(['fr']),
  oddsFormat: choice('oddsFormat'),
  timezone: choice('timezone'),
  reduceMotion: vine.boolean().optional(),
})
