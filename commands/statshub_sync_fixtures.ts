import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import { writeFile } from 'node:fs/promises'

export default class StatshubSyncFixtures extends BaseCommand {
  static commandName = 'statshub:sync-fixtures'
  static description = 'Fetch football fixtures from the StatsHub API (Parse) and store them'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({
    description: 'First day to fetch (YYYY-MM-DD), defaults to today UTC',
    required: false,
  })
  declare date?: string

  @flags.number({
    description: 'How many consecutive days to fetch (1 credit per day)',
    default: 1,
  })
  declare days: number

  @flags.boolean({ description: 'Save the raw API response to tmp/ for debugging' })
  declare raw: boolean

  @flags.boolean({
    description: 'Download missing team and competition logos afterwards (free)',
    default: true,
    showNegatedVariantInHelp: true,
  })
  declare logos: boolean

  async run() {
    const { default: StatsHubClient } = await import('#services/statshub_client')
    const { default: Fixture } = await import('#models/fixture')
    const client = await this.app.container.make(StatsHubClient)

    const start = this.date
      ? DateTime.fromISO(this.date, { zone: 'utc' })
      : DateTime.utc().startOf('day')
    if (!start.isValid) {
      this.logger.error(`Invalid date "${this.date}", expected YYYY-MM-DD`)
      this.exitCode = 1
      return
    }

    for (let offset = 0; offset < Math.max(1, this.days); offset++) {
      const date = start.plus({ days: offset }).toISODate()!

      let fixtures
      try {
        const response = await client.fixturesByDate(date)
        if (this.raw) {
          const file = this.app.tmpPath(`statshub-raw-${date}.json`)
          await writeFile(file, JSON.stringify(response, null, 2))
          this.logger.info(`Raw response saved to ${file}`)
          this.logger.info(`Top-level keys: ${Object.keys(response ?? {}).join(', ')}`)
        }
        fixtures = response.fixtures ?? []
      } catch (error) {
        this.logger.error((error as Error).message)
        this.exitCode = 1
        return
      }

      fixtures = fixtures.filter(
        (fixture) => fixture.event_id && fixture.home_team && fixture.away_team
      )
      for (const fixture of fixtures) {
        await Fixture.upsertFromApi(fixture, date)
      }

      this.logger.success(`${date}: ${fixtures.length} fixtures saved`)
      const table = this.ui
        .table()
        .head(['Kick-off (UTC)', 'Competition', 'Match', 'Score', 'Status'])
      for (const fixture of fixtures.slice(0, 10)) {
        table.row([
          fixture.start_timestamp
            ? DateTime.fromSeconds(fixture.start_timestamp, { zone: 'utc' }).toFormat('HH:mm')
            : '',
          fixture.tournament?.name ?? '',
          `${fixture.home_team.name} - ${fixture.away_team.name}`,
          fixture.home_score !== null && fixture.home_score !== undefined
            ? `${fixture.home_score}-${fixture.away_score}`
            : '',
          fixture.status ?? '',
        ])
      }
      table.render()
    }

    if (this.logos) {
      await this.kernel.exec('statshub:sync-logos', [])
    }
  }
}
