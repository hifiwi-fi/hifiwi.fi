/**
 * @import { DataDeps, PageFunction } from '@domstack/static/types.js'
 * @import { BlogIndexData } from '../global.data.js'
 * @import { HtmlResult } from 'fragtml/types.js'
 */
import { html } from 'fragtml'
import { basename } from 'node:path'

export const vars = {
  title: 'Recent Blog Posts',
  layout: 'blog-index',
  noindex: true,
  dataDeps: /** @satisfies {DataDeps<BlogIndexData>} */ (['recentBlogPosts', 'blogArchives'])
}

/**
 * @type {PageFunction<{
 *  siteName: string,
 *  siteDescription: string,
 *  siteUrl: string,
 *  authorName: string,
 *  authorUrl: string,
 *  authorImgUrl: string
 *  layout: string,
 *  publishDate: string
 *  title: string
 * }, HtmlResult, BlogIndexData>}
 */
export default function blogIndex2023 ({
  data
}) {
  const blogPosts = data.recentBlogPosts
  const folderPages = data.blogArchives

  return html`
    <ul class="blog-index-list">
      ${blogPosts.map(p => {
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
    </ul>
    <footer class="blog-index-footer">
      <h4>Archive</h4>
      <ul class="archive-list">
        ${folderPages.map(p => {
          return html`<li>
            <a href="/${p.path}/">${basename(p.path)}</a>
          </li>`
        })}
      <ul>
    </footer>
    `
}
