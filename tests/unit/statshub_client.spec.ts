import { test } from '@japa/runner'
import StatsHubClient from '#services/statshub_client'
import StatsHubException from '#exceptions/statshub_exception'
import Fixture from '#models/fixture'

const config = {
  apiKey: 'pmx_test',
  baseUrl: 'https://api.parse.bot',
  scraperId: 'scraper-123',
  timeoutMs: 1000,
}

const fixture = {
  event_id: 111,
  status: 'notstarted',
  country: 'France',
  round: 9,
  start_timestamp: Date.UTC(2026, 9, 15, 19, 0) / 1000,
  home_team: { id: 1, name: 'Paris Saint-Germain' },
  away_team: { id: 2, name: 'Olympique de Marseille' },
  home_score: null,
  away_score: null,
  tournament: { id: 34, name: 'Ligue 1' },
}

test.group('StatsHubClient', () => {
  test('sends the API key and date to the Parse endpoint', async ({ assert }) => {
    let calledUrl = ''
    let headers: Record<string, string> = {}
    const client = new StatsHubClient({
      ...config,
      fetch: async (url, init) => {
        calledUrl = String(url)
        headers = init?.headers as Record<string, string>
        return Response.json({ date: '2026-10-15', total_fixtures: 1, fixtures: [fixture] })
      },
    })

    const response = await client.fixturesByDate('2026-10-15')

    assert.equal(
      calledUrl,
      'https://api.parse.bot/scraper/scraper-123/get_fixtures_by_date?date=2026-10-15'
    )
    assert.equal(headers['X-API-Key'], 'pmx_test')
    assert.equal(response.fixtures[0].home_team.name, 'Paris Saint-Germain')
  })

  test('turns a Parse rate-limit error into a StatsHubException', async ({ assert }) => {
    const client = new StatsHubClient({
      ...config,
      fetch: async () =>
        Response.json(
          {
            error: { error: 'rate_limited', message: 'Burst limit hit', retry_after: 12 },
            status_code: 429,
          },
          { status: 429, headers: { 'Retry-After': '12' } }
        ),
    })

    try {
      await client.fixturesByDate()
      assert.fail('expected an exception')
    } catch (error) {
      assert.instanceOf(error, StatsHubException)
      if (!(error instanceof StatsHubException)) return
      assert.equal(error.status, 429)
      assert.equal(error.retryAfter, 12)
      assert.include(error.message, 'Burst limit hit')
    }
  })

  test('reports when Parse cannot be reached', async ({ assert }) => {
    const client = new StatsHubClient({
      ...config,
      fetch: async () => {
        throw new TypeError('fetch failed')
      },
    })

    await assert.rejects(() => client.fixturesByDate(), /Could not reach Parse/)
  })

  test('refuses to call Parse without an API key', async ({ assert }) => {
    const client = new StatsHubClient({ ...config, apiKey: undefined })
    await assert.rejects(() => client.fixturesByDate(), /PARSE_API_KEY is not set/)
  })
})

test.group('Fixture.attributesFromApi', () => {
  test('maps a StatsHub fixture to our columns', ({ assert }) => {
    const attributes = Fixture.attributesFromApi(fixture, '2026-10-15')

    assert.equal(attributes.eventId, 111)
    assert.equal(attributes.homeTeamName, 'Paris Saint-Germain')
    assert.equal(attributes.tournamentName, 'Ligue 1')
    assert.equal(attributes.round, '9')
    assert.equal(attributes.startsAt?.toISO(), '2026-10-15T19:00:00.000Z')
    assert.isNull(attributes.homeScore)
  })
})
