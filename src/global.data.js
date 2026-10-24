/**
 * @import { GlobalDataFunctionParams } from '@domstack/static/types.js'
 */
import { html, render } from 'fragtml'
import { dirname } from 'node:path'
import pMap from 'p-map'

/**
 * @typedef {{ path: string, title: string, publishDate: string | null }} BlogPost
 * @typedef {{ date_published: string, title: string, url: string, id: string, content_html: string }} FeedItem
 * @typedef {{ blogPostsHtml: string }} HomeData
 * @typedef {{ recentBlogPosts: BlogPost[], blogArchives: { path: string, title: string }[] }} BlogIndexData
 * @typedef {{ folderPages: Record<string, BlogPost[]> }} BlogArchiveData
 * @typedef {{ feedItems: FeedItem[] }} FeedData
 * @typedef {{ sitemapPaths: string[] }} SitemapData
 * @typedef {HomeData & BlogIndexData & BlogArchiveData & FeedData & SitemapData} GlobalData
 * @typedef {{ layout: string, title: string, publishDate: string, noindex?: boolean, siteUrl: string }} SourceVars
 * @typedef {SourceVars & { path: string, sourceId: string, contentHtml?: string }} StoredPage
 * @typedef {{ pagesBySource: Map<string, StoredPage> }} GlobalDataState
 */

/**
 * @param {GlobalDataFunctionParams<SourceVars, string, GlobalDataState>} params
 * @returns {Promise<GlobalData>}
 */
export default async function globalData ({ pages, changes, previousState, setState }) {
  const incremental = changes.kind === 'delta' && previousState !== undefined
  /** @type {Map<string, StoredPage>} */
  const pagesBySource = incremental ? new Map(previousState.pagesBySource) : new Map()

  if (changes.kind === 'delta') {
    for (const sourceId of changes.removed) pagesBySource.delete(sourceId)
  }

  // Upserts replace the complete record, invalidating any cached article HTML.
  for (const page of incremental && changes.kind === 'delta' ? changes.upserted : pages) {
    const { layout, title, publishDate, noindex, siteUrl } = page.vars
    pagesBySource.set(page.sourceId, {
      sourceId: page.sourceId,
      path: page.pageInfo.path,
      layout,
      title,
      publishDate,
      noindex: noindex ?? false,
      siteUrl
    })
  }

  // Preserve discovery order even when delta updates change Map insertion order.
  const sourcePages = new Map(pages.map(page => [page.sourceId, page]))
  const records = pages.map(page => {
    const record = pagesBySource.get(page.sourceId)
    if (!record) throw new Error(`Missing global data record for ${page.sourceId}`)
    return record
  })
  const blogPosts = records
    .filter(page => page.layout === 'article')
    .sort((a, b) => new Date(b.publishDate ?? '').getTime() - new Date(a.publishDate ?? '').getTime())

  /** @type {Record<string, BlogPost[]>} */
  const folderPages = {}
  for (const page of records) {
    const folder = dirname(page.path)
    const entries = folderPages[folder] ?? (folderPages[folder] = [])
    entries.push({
      path: page.path,
      title: page.title,
      publishDate: page.publishDate ?? null
    })
  }

  const recentBlogPosts = blogPosts.slice(0, 50).map(page => ({
    path: page.path,
    title: page.title,
    publishDate: page.publishDate ?? null
  }))

  const blogPostsHtml = render(html`<ul class="blog-index-list">
      ${recentBlogPosts.slice(0, 5).map(p => {
        const publishDate = p.publishDate ? new Date(p.publishDate) : null
        return html`
          <li class="blog-entry h-entry">
            <a class="blog-entry-link u-url u-uid p-name" href="/${p.path}/">${p.title}</a>
            ${
              publishDate
                ? html`<time class="blog-entry-date dt-published" datetime="${publishDate.toISOString()}">
                    ${publishDate.toISOString().split('T')[0]}
                  </time>`
                : null
            }
          </li>`
      })}
    </ul>`)

  const feedItems = await pMap(blogPosts.slice(0, 10), async page => {
    let contentHtml = page.contentHtml
    if (contentHtml === undefined) {
      const source = sourcePages.get(page.sourceId)
      if (!source) throw new Error(`Missing feed source for ${page.sourceId}`)
      contentHtml = await source.renderInnerPage()
      pagesBySource.set(page.sourceId, { ...page, contentHtml })
    }
    return {
      date_published: page.publishDate,
      title: page.title,
      url: `${page.siteUrl}/${page.path}/`,
      id: `${page.siteUrl}/${page.path}/#${page.publishDate}`,
      content_html: contentHtml
    }
  }, { concurrency: 4 })

  setState({ pagesBySource })

  return {
    blogPostsHtml,
    recentBlogPosts,
    blogArchives: (folderPages['blog'] ?? []).map(({ path, title }) => ({ path, title })),
    folderPages,
    feedItems,
    sitemapPaths: records.filter(page => !page.noindex).map(page => page.path)
  }
}
