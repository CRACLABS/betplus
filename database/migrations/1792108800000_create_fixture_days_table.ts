import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * One row per day already fetched from StatsHub, so browsing to a day
 * never spends a Parse credit twice for the same data.
 */
export default class extends BaseSchema {
  protected tableName = 'fixture_days'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.date('date').notNullable().unique()
      table.integer('fixtures_count').notNullable().defaultTo(0)
      table.timestamp('fetched_at').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
