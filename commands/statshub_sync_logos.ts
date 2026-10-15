import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class StatshubSyncLogos extends BaseCommand {
  static commandName = 'statshub:sync-logos'
  static description =
    'Download the team and competition logos of the stored fixtures into public/logos (no Parse credits)'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const { default: LogoStore } = await import('#services/logo_store')
    const { default: Fixture } = await import('#models/fixture')
    const store = new LogoStore()

    const counts = await store.downloadFor(await Fixture.all())
    this.logger.info(`${counts.tournaments} competitions and ${counts.teams} teams checked`)
    if (counts.error) this.logger.warning(`Could not download some logos: ${counts.error}`)

    this.logger.success(
      `Logos: ${counts.saved} downloaded, ${counts.exists} already there, ${counts.missing} not available, ${counts.failed} failed`
    )
    if (counts.failed && !counts.saved && !counts.exists) this.exitCode = 1
  }
}
