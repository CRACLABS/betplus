import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * statshub_calls: one row per paid StatsHub call, to stay inside the monthly
 * Parse credits. match_stats: cached get_match_stats answers per match.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('statshub_calls', (table) => {
      table.increments('id')
      table.string('endpoint').notNullable()
      table.integer('credits').notNullable()
      table.timestamp('created_at').notNullable().index()
    })

    this.schema.createTable('match_stats', (table) => {
      table.increments('id')
      table.integer('event_id').notNullable().unique()
      table.jsonb('payload').notNullable()
      table.boolean('is_final').notNullable().defaultTo(false)
      table.timestamp('fetched_at').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable('match_stats')
    this.schema.dropTable('statshub_calls')
  }
}
