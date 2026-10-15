import { test } from '@japa/runner'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import LogoStore from '#services/logo_store'

function storeWith(response: Response, calls: string[] = []) {
  const dir = mkdtempSync(join(tmpdir(), 'logos-'))
  const store = new LogoStore({
    baseUrl: 'https://images.test/api/v1/',
    publicPath: (path) => join(dir, path),
    fetch: async (url) => {
      calls.push(String(url))
      return response.clone()
    },
  })
  return { store, dir }
}

const png = () =>
  new Response(new Uint8Array([137, 80, 78, 71]), { headers: { 'content-type': 'image/png' } })

test.group('LogoStore', () => {
  test('downloads team and competition logos to public/logos', async ({ assert }) => {
    const calls: string[] = []
    const { store, dir } = storeWith(png(), calls)

    assert.equal(await store.download('teams', 2509), 'saved')
    assert.equal(await store.download('tournaments', 242), 'saved')
    assert.deepEqual(calls, [
      'https://images.test/api/v1/team/2509/image',
      'https://images.test/api/v1/unique-tournament/242/image',
    ])
    assert.deepEqual([...readFileSync(join(dir, 'logos/teams/2509.png'))], [137, 80, 78, 71])
  })

  test('skips logos already on disk', async ({ assert }) => {
    const calls: string[] = []
    const { store } = storeWith(png(), calls)
    await store.download('teams', 1)
    assert.equal(await store.download('teams', 1), 'exists')
    assert.lengthOf(calls, 1)
  })

  test('ignores missing images and non-image answers', async ({ assert }) => {
    const notFound = storeWith(new Response('nope', { status: 404 }))
    assert.equal(await notFound.store.download('teams', 7), 'missing')
    assert.isFalse(existsSync(join(notFound.dir, 'logos/teams/7.png')))

    const html = storeWith(new Response('<html>', { headers: { 'content-type': 'text/html' } }))
    assert.equal(await html.store.download('teams', 7), 'missing')
  })
})
