import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { writeFile } from 'node:fs/promises'

export default class StatshubMatchStats extends BaseCommand {
  static commandName = 'statshub:match-stats'
  static description =
    'Fetch xG and player stats for one stored match and save the raw answer to tmp/ (5 credits)'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'event_id of a match from statshub:sync-fixtures' })
  declare eventId: string

  async run() {
    const { default: Fixture } = await import('#models/fixture')
    const { default: StatsHubClient } = await import('#services/statshub_client')
    const { default: CreditLedger } = await import('#services/credit_ledger')

    const fixture = await Fixture.findBy('eventId', Number(this.eventId))
    if (!fixture) {
      this.logger.error(`No stored match with event_id ${this.eventId}`)
      this.exitCode = 1
      return
    }

    try {
      const stats = await new StatsHubClient().matchStats(fixture)
      await CreditLedger.record('get_match_stats')
      const file = this.app.tmpPath(`statshub-match-${this.eventId}.json`)
      await writeFile(file, JSON.stringify(stats, null, 2))
      this.logger.success(`${fixture.homeTeamName} - ${fixture.awayTeamName}: saved to ${file}`)
      this.logger.info(`Keys: ${Object.keys(stats ?? {}).join(', ')}`)
    } catch (error) {
      this.logger.error((error as Error).message)
      this.exitCode = 1
    }
  }
}
