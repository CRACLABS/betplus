/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/**
 * French error messages shown under form fields.
 */
vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'Ce champ est obligatoire',
  'email': 'Adresse email invalide',
  'minLength': 'Au moins {{ min }} caractères',
  'maxLength': '{{ max }} caractères maximum',
  'regex': 'Format invalide',
  'enum': 'Choix invalide',
  'confirmed': 'Les mots de passe ne correspondent pas',
  'database.unique': 'Déjà utilisé par un autre membre',
  'username.regex': 'Lettres minuscules, chiffres et _ uniquement',
})
