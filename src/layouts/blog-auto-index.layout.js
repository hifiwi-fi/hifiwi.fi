/**
 * @import { LayoutFunction } from '@domstack/static'
 * @import { HtmlResult } from 'fragtml/types.js'
 * @import { BlogIndexVars } from './blog-index.layout.js'
 */
import { html, raw, render } from 'fragtml'
import { dirname } from 'node:path'

/**
 * @typedef {BlogIndexVars} AutoBlogIndexVars
 */

import blogIndexLayout from './blog-index.layout.js'

/** @type {LayoutFunction<AutoBlogIndexVars, string | HtmlResult, string>} */
export default function blogAutoIndexLayout (args) {
  const { children, ...rest } = args

  const folderPages = args.pages.filter(folderPage => {
    const dir = dirname(folderPage.pageInfo.path)
    const path = args.page.path
    return dir === path
  })

  const wrappedChildren = render(html`
    <ul class="blog-index-list">
      ${folderPages.map(p => {
        const publishDate = p.vars.publishDate ? new Date(p.vars.publishDate) : null
        return html`
          <li class="blog-entry h-entry">
            <a class="blog-entry-link u-url u-uid p-name" href="/${p.pageInfo.path}/">${p.vars.title}</a>
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

  return blogIndexLayout({ children: wrappedChildren, ...rest })
}
