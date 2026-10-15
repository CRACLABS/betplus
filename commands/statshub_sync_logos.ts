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

    const fixtures = await Fixture.all()
    const teams = new Set<number>()
    const tournaments = new Set<number>()
    for (const fixture of fixtures) {
      teams.add(fixture.homeTeamId)
      teams.add(fixture.awayTeamId)
      if (fixture.uniqueTournamentId) tournaments.add(fixture.uniqueTournamentId)
    }

    const counts = { saved: 0, exists: 0, missing: 0, failed: 0 }
    const jobs = [
      ...[...tournaments].map((id) => ['tournaments', id] as const),
      ...[...teams].map((id) => ['teams', id] as const),
    ]
    this.logger.info(`${tournaments.size} competitions and ${teams.size} teams to check`)

    for (const [kind, id] of jobs) {
      try {
        const result = await store.download(kind, id)
        counts[result]++
        // Be gentle with the image server.
        if (result === 'saved') await new Promise((resolve) => setTimeout(resolve, 150))
      } catch (error) {
        counts.failed++
        if (counts.failed === 1)
          this.logger.warning(`Could not download logos: ${(error as Error).message}`)
      }
    }

    this.logger.success(
      `Logos: ${counts.saved} downloaded, ${counts.exists} already there, ${counts.missing} not available, ${counts.failed} failed`
    )
    if (counts.failed && !counts.saved && !counts.exists) this.exitCode = 1
  }
}
