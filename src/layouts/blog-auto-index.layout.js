/**
 * @import { DataDeps, LayoutFunction } from '@domstack/static/types.js'
 * @import { BlogArchiveData } from '../global.data.js'
 * @import { HtmlResult } from 'fragtml/types.js'
 * @import { BlogIndexVars } from './blog-index.layout.js'
 */
import { html, raw, render } from 'fragtml'

/**
 * @typedef {BlogIndexVars} AutoBlogIndexVars
 */

export const parentLayout = 'blog-index'

export const vars = {
  dataDeps: /** @satisfies {DataDeps<BlogArchiveData>} */ (['folderPages'])
}

/** @type {LayoutFunction<AutoBlogIndexVars, string | HtmlResult, string, BlogArchiveData>} */
export default function blogAutoIndexLayout (args) {
  const { children, data, page } = args
  const folderPages = data.folderPages[page.path] ?? []

  return render(html`
    <ul class="blog-index-list">
      ${folderPages.map(p => {
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
    ${typeof children === 'string'
      ? raw(children)
      : children
    }
  `)
}
