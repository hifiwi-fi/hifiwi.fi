/**
 * @import { DataDeps, TemplateFunction } from '@domstack/static/types.js'
 * @import { SitemapData } from './global.data.js'
 */
import builder from 'xmlbuilder'

/** @satisfies {DataDeps<SitemapData>} */
export const dataDeps = ['sitemapPaths']

/** @type {TemplateFunction<{
 *  siteName: string,
 *  siteDescription: string,
 *  siteUrl: string,
 *  authorName: string,
 *  authorUrl: string,
 *  authorImgUrl: string
 *  layout: string,
 *  publishDate: string
 *  title: string,
 *  noindex?: boolean
 * }, SitemapData>} */
export default ({
  vars: {
    siteUrl
  },
  data
}) => {
  const sitemapObj = {
    urlset: {
      '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      url: data.sitemapPaths.map(path => ({
        loc: `${siteUrl}/${path}${path && !path.endsWith('.html') ? '/' : ''}`
      }))
    }
  }
  const feed = builder.create(sitemapObj, { encoding: 'utf-8' })
  return feed.end({ pretty: true, allowEmpty: false })
}
