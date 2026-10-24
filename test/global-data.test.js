import assert from 'node:assert/strict'
import test from 'node:test'
import globalData from '../src/global.data.js'

function sourcePage (path, vars = {}, content = `<p>${path}</p>`) {
  let renders = 0
  return {
    sourceId: `${path}/README.md`,
    pageInfo: { path },
    vars: {
      layout: 'article',
      title: path,
      publishDate: '2025-01-01',
      siteUrl: 'https://hifiwi.fi',
      ...vars
    },
    get renders () { return renders },
    async renderInnerPage () {
      renders++
      if (content instanceof Error) throw content
      return content
    }
  }
}

function pipeline () {
  let state
  return {
    get state () { return state },
    async build (pages, changes = { kind: 'reset', reason: 'initial', events: [] }) {
      const output = await globalData({
        pages,
        changes,
        previousState: state === undefined ? undefined : structuredClone(state),
        setState (next) { state = structuredClone(next) }
      })
      return output
    }
  }
}

function delta (upserted = [], removed = []) {
  return { kind: 'delta', upserted, removed, events: [] }
}

test('no-op and unrelated updates reuse feed HTML and preserve published data', async () => {
  const article = sourcePage('blog/2025/article')
  const home = sourcePage('', { layout: 'root', title: '' })
  const run = pipeline()
  const initial = await run.build([home, article])

  assert.deepEqual(await run.build([home, article], delta()), initial)
  assert.equal(article.renders, 1)

  const changedHome = sourcePage('', { layout: 'root', title: '' }, '<p>Updated home</p>')
  assert.deepEqual(await run.build([changedHome, article], delta([changedHome])), initial)
  assert.equal(article.renders, 1)
  assert.equal(changedHome.renders, 0)
  assert.equal(run.state.pagesBySource.get(article.sourceId).contentHtml, '<p>blog/2025/article</p>')
})

test('article edits rerender only the changed article and match a clean rebuild', async () => {
  const first = sourcePage('blog/2025/first', { publishDate: '2025-02-01' })
  const second = sourcePage('blog/2025/second')
  const run = pipeline()
  const initial = await run.build([first, second])
  const changed = sourcePage(first.pageInfo.path, first.vars, '<p>Edited body</p>')
  const updated = await run.build([changed, second], delta([changed]))

  assert.equal(first.renders, 1)
  assert.equal(changed.renders, 1)
  assert.equal(second.renders, 1)
  assert.deepEqual(updated.recentBlogPosts, initial.recentBlogPosts)
  assert.equal(updated.blogPostsHtml, initial.blogPostsHtml)
  assert.deepEqual(updated.sitemapPaths, initial.sitemapPaths)
  assert.equal(updated.feedItems[0].content_html, '<p>Edited body</p>')
  assert.deepEqual(updated, await pipeline().build([changed, second]))
})

test('additions, removals, and metadata edits update every derived collection', async () => {
  const original = sourcePage('blog/2023/original', { publishDate: '2023-01-01' })
  const archive = sourcePage('blog/2023', { layout: 'blog-auto-index', noindex: true })
  const run = pipeline()
  await run.build([archive, original])

  const added = sourcePage('blog/2025/new', { publishDate: '2025-01-01' })
  const addedData = await run.build([archive, original, added], delta([added]))
  assert.equal(addedData.recentBlogPosts[0].path, added.pageInfo.path)
  assert.ok(addedData.blogPostsHtml.includes(added.pageInfo.path))
  assert.equal(original.renders, 1)

  const changed = sourcePage(added.pageInfo.path, { ...added.vars, title: 'Changed title', noindex: true })
  const pages = [archive, changed]
  const updated = await run.build(pages, delta([changed], [original.sourceId]))
  assert.equal(run.state.pagesBySource.has(original.sourceId), false)
  assert.deepEqual(updated.folderPages['blog/2023'], undefined)
  assert.equal(updated.recentBlogPosts[0].title, 'Changed title')
  assert.deepEqual(updated.sitemapPaths, [])
  assert.deepEqual(updated, await pipeline().build(pages))
})

test('the feed renders newly promoted entries but not articles outside its top ten', async () => {
  const pages = Array.from({ length: 11 }, (_, index) => sourcePage(`blog/2025/post-${index}`, {
    publishDate: `2025-01-${String(index + 1).padStart(2, '0')}`
  }))
  const run = pipeline()
  await run.build(pages)
  assert.equal(pages[0].renders, 0)
  assert.ok(pages.slice(1).every(page => page.renders === 1))

  const removed = pages[10]
  const remaining = pages.slice(0, 10)
  const updated = await run.build(remaining, delta([], [removed.sourceId]))
  assert.equal(pages[0].renders, 1)
  assert.ok(pages.slice(1, 10).every(page => page.renders === 1))
  assert.equal(updated.feedItems.length, 10)
  assert.deepEqual(updated, await pipeline().build(remaining))
})

test('reset invalidates cached HTML and delta without prior state safely initializes', async () => {
  const page = sourcePage('blog/2025/article')
  const run = pipeline()
  const initial = await run.build([page], delta([page]))
  assert.equal(page.renders, 1)
  assert.deepEqual(await run.build([page], { kind: 'reset', reason: 'global-vars', events: [] }), initial)
  assert.equal(page.renders, 2)
})

test('failed rendering does not commit partial producer state', async () => {
  const article = sourcePage('blog/2025/article')
  const run = pipeline()
  const initial = await run.build([article])
  const previous = structuredClone(run.state)
  const broken = sourcePage(article.pageInfo.path, article.vars, new Error('render failed'))
  await assert.rejects(run.build([broken], delta([broken])), /render failed/)
  assert.deepEqual(run.state, previous)
  assert.deepEqual(await run.build([article], delta()), initial)
  assert.equal(article.renders, 1)
})
