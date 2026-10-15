import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Display preferences edited from Paramètres > Préférences (theme, accent,
 * font, text size, language, odds format, time zone).
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('preferences').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('preferences')
    })
  }
}
