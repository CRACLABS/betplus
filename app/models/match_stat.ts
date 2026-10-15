import { MatchStatSchema } from '#database/schema'

export type PlayerStat = {
  name: string
  goals: number
  shots: number
  shotsOnTarget: number
  xg: number
}

/**
 * Cached get_match_stats answer for one match (see MatchStatsService).
 */
export default class MatchStat extends MatchStatSchema {
  private num(value: unknown) {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }

  get homeXg() {
    return this.num(this.payload?.home_xg)
  }

  get awayXg() {
    return this.num(this.payload?.away_xg)
  }

  private players(list: unknown): PlayerStat[] {
    if (!Array.isArray(list)) return []
    return list
      .map((player: any) => ({
        name: String(player?.name ?? player?.player_name ?? '?'),
        goals: this.num(player?.goals),
        shots: this.num(player?.shots),
        shotsOnTarget: this.num(player?.shots_on_target),
        xg: this.num(player?.expected_goals ?? player?.xg),
      }))
      .sort((a, b) => b.xg - a.xg || b.shots - a.shots)
  }

  get homePlayers() {
    return this.players(this.payload?.home_players)
  }

  get awayPlayers() {
    return this.players(this.payload?.away_players)
  }

  /**
   * Shot totals per side, summed from the player rows.
   */
  get totals() {
    const sum = (players: PlayerStat[], key: keyof PlayerStat) =>
      players.reduce((total, player) => total + (player[key] as number), 0)
    return {
      home: {
        shots: sum(this.homePlayers, 'shots'),
        onTarget: sum(this.homePlayers, 'shotsOnTarget'),
      },
      away: {
        shots: sum(this.awayPlayers, 'shots'),
        onTarget: sum(this.awayPlayers, 'shotsOnTarget'),
      },
    }
  }

  /**
   * StatsHub returns zero xG and no players when it has no shot map for the match.
   */
  get hasCoverage() {
    return this.homeXg + this.awayXg > 0 || this.homePlayers.length + this.awayPlayers.length > 0
  }
}
