/**
 * @import { LayoutFunction } from '@domstack/static/types.js'
 * @import { HtmlResult } from 'fragtml/types.js'
 * @import { RootLayoutVars } from './root.layout.js'
 */
import { html, raw, render } from 'fragtml'
import { sep } from 'node:path'
import { breadcrumb } from '../components/breadcrumb/index.js'

/**
 * @typedef {RootLayoutVars & {
 *  title: string,
 *  publishDate: string,
 *  [key: string]: any
 * }} BlogIndexVars
 */

export const parentLayout = 'root'

/** @type {LayoutFunction<BlogIndexVars, string | HtmlResult, string>} */
export default function blogIndexLayout (args) {
  const { children } = args
  const pathSegments = args.page.path.split(sep)
  return render(html`
    ${breadcrumb({ pathSegments })}
    <h1>${args.vars.title}</h1>
    ${typeof children === 'string'
      ? raw(children)
      : children
    }
  `)
}
