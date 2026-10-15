import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Public profile fields edited from Paramètres > Profil.
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('username', 30).nullable().unique()
      table.string('bio', 280).nullable()
      table.string('favorite_sport', 40).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('username')
      table.dropColumn('bio')
      table.dropColumn('favorite_sport')
    })
  }
}
