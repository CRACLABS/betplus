import statshubConfig from '#config/statshub'
import app from '@adonisjs/core/services/app'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export type LogoKind = 'teams' | 'tournaments'

type Options = { baseUrl: string; fetch?: typeof fetch; publicPath?: (path: string) => string }

/**
 * Team and competition logos, downloaded once into public/logos/<kind>/<id>.png
 * and served as static files. Pages only check whether the file exists.
 */
export default class LogoStore {
  constructor(private options: Options = { baseUrl: statshubConfig.logoBaseUrl }) {}

  static url(kind: LogoKind, id: number | null | undefined) {
    if (!id) return null
    return existsSync(app.publicPath(`logos/${kind}/${id}.png`)) ? `/logos/${kind}/${id}.png` : null
  }

  private filePath(kind: LogoKind, id: number) {
    return (this.options.publicPath ?? app.publicPath.bind(app))(`logos/${kind}/${id}.png`)
  }

  private remoteUrl(kind: LogoKind, id: number) {
    const base = this.options.baseUrl.replace(/\/+$/, '')
    return kind === 'teams' ? `${base}/team/${id}/image` : `${base}/unique-tournament/${id}/image`
  }

  /**
   * Download a logo unless it is already on disk.
   * Returns 'exists', 'saved' or 'missing' (no image for this id).
   */
  async download(kind: LogoKind, id: number): Promise<'exists' | 'saved' | 'missing'> {
    const file = this.filePath(kind, id)
    if (existsSync(file)) return 'exists'

    const response = await (this.options.fetch ?? fetch)(this.remoteUrl(kind, id), {
      headers: {
        'Accept': 'image/png,image/*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(15_000),
    })
    const type = response.headers.get('content-type') ?? ''
    if (!response.ok || !type.startsWith('image/')) return 'missing'

    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, Buffer.from(await response.arrayBuffer()))
    return 'saved'
  }
}
