/** @import { GlobalDataFunction } from '@domstack/static' */
import { html, render } from 'fragtml'

/** @type {GlobalDataFunction<{ blogPostsHtml: string }>} */
export default function globalData ({
  pages
}) {
  const blogPosts = pages
    .filter(page => page.vars.layout === 'article')
    .sort((a, b) => new Date(b.vars.publishDate).getTime() - new Date(a.vars.publishDate).getTime())
    .slice(0, 5)

  const blogpostsHtml = render(html`<ul class="blog-index-list">
      ${blogPosts.map(p => {
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
    </ul>`)

  return {
    blogPostsHtml: blogpostsHtml
  }
}
