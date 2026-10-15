import statshubConfig from '#config/statshub'
import StatsHubException from '#exceptions/statshub_exception'

export type StatsHubTeam = { id: number; name: string; short_name?: string }

export type StatsHubFixture = {
  event_id: number
  slug?: string
  round?: string | number | null
  status?: string | null
  country?: string | null
  winner_code?: number | null
  start_timestamp?: number | null
  has_lineup?: boolean
  home_team: StatsHubTeam
  away_team: StatsHubTeam
  home_score?: number | null
  away_score?: number | null
  tournament?: { id: number; name: string; unique_id?: number; unique_name?: string } | null
}

export type FixturesByDateResponse = {
  date: string
  total_fixtures: number
  fixtures: StatsHubFixture[]
}

type Options = typeof statshubConfig & { fetch?: typeof fetch }

/**
 * Thin client for the "statshub.com API" hosted on Parse.
 * Every successful call spends Parse credits (fixtures = 1, match stats = 5).
 */
export default class StatsHubClient {
  constructor(private options: Options = statshubConfig) {}

  /**
   * Football fixtures for one day (YYYY-MM-DD, defaults to today UTC). Costs 1 credit.
   */
  fixturesByDate(date?: string) {
    return this.get<FixturesByDateResponse>('get_fixtures_by_date', date ? { date } : {})
  }

  /**
   * Raw GET on any StatsHub endpoint.
   */
  async get<T = unknown>(
    endpoint: string,
    query: Record<string, string | number> = {}
  ): Promise<T> {
    if (!this.options.apiKey) {
      throw new StatsHubException('PARSE_API_KEY is not set. Add it to your .env file.', {
        status: 0,
      })
    }

    const url = new URL(
      `${this.options.baseUrl.replace(/\/$/, '')}/scraper/${this.options.scraperId}/${endpoint}`
    )
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value))
    }

    const doFetch = this.options.fetch ?? fetch
    let response: Response
    try {
      response = await doFetch(url, {
        headers: { 'X-API-Key': this.options.apiKey, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(this.options.timeoutMs),
      })
    } catch (error) {
      throw new StatsHubException(
        `Could not reach Parse (${endpoint}): ${(error as Error).message}`,
        {
          status: 0,
          cause: error,
        }
      )
    }

    if (!response.ok) {
      throw await StatsHubException.fromResponse(endpoint, response)
    }

    // Parse wraps endpoint results as { status: 'success', data: {...} }
    const body = (await response.json()) as { status?: string; data?: T } | T
    if (body && typeof body === 'object' && 'data' in body && 'status' in body) {
      return body.data as T
    }
    return body as T
  }
}
