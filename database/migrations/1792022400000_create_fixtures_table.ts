import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fixtures'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('event_id').notNullable().unique()
      table.date('match_date').notNullable().index()
      table.timestamp('starts_at').nullable()
      table.string('status').nullable()
      table.string('country').nullable()
      table.integer('tournament_id').nullable()
      table.string('tournament_name').nullable()
      table.string('round').nullable()
      table.integer('home_team_id').notNullable()
      table.string('home_team_name').notNullable()
      table.integer('away_team_id').notNullable()
      table.string('away_team_name').notNullable()
      table.smallint('home_score').nullable()
      table.smallint('away_score').nullable()
      table.smallint('winner_code').nullable()
      table.jsonb('payload').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
