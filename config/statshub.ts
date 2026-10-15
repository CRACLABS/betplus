import env from '#start/env'

/**
 * StatsHub football data, served by Parse (https://docs.parse.bot).
 * Free tier: 200 credits/month and 5 requests/minute, so the app only
 * calls it from `node ace statshub:sync-fixtures`, never on page load.
 */
const statshubConfig = {
  apiKey: env.get('PARSE_API_KEY'),
  baseUrl: env.get('PARSE_API_URL', 'https://api.parse.bot'),
  scraperId: env.get('STATSHUB_SCRAPER_ID', 'e1f0e079-0946-4b6c-9e3c-9227eddaa64a'),
  timeoutMs: 30_000,
  /**
   * Team and competition logos. StatsHub ids are the same as SofaScore's, so
   * `node ace statshub:sync-logos` downloads the images from its image server
   * once into public/logos/ (no Parse credits spent).
   */
  logoBaseUrl: env.get('LOGO_BASE_URL', 'https://img.sofascore.com/api/v1'),
}

export default statshubConfig
