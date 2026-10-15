import { Exception } from '@adonisjs/core/exceptions'

/**
 * Raised when a call to the StatsHub API (Parse) fails. `status` is the
 * HTTP status (0 when Parse could not be reached).
 */
export default class StatsHubException extends Exception {
  static status = 502
  static code = 'E_STATSHUB'

  retryAfter: number | null = null

  static async fromResponse(endpoint: string, response: Response) {
    const body = await response.text()
    let detail = body

    try {
      // Parse errors are {"error": "reason"} or {"error": {"status", "message", ...}}; a wrong path is {"detail": ...}
      const json = JSON.parse(body)
      const error = json.error ?? json.detail
      detail =
        typeof error === 'object' && error !== null
          ? (error.message ?? error.status ?? body)
          : (error ?? body)
    } catch {}

    const exception = new StatsHubException(
      `StatsHub ${endpoint} failed (${response.status}): ${detail}`,
      { status: response.status }
    )
    const retryAfter = response.headers.get('retry-after')
    exception.retryAfter = retryAfter ? Number(retryAfter) : null

    return exception
  }
}
