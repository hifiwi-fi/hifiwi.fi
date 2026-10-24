/** @import { TemplateFunction } from '@domstack/static/types.js' */

/** @type {TemplateFunction<{
 *  siteName: string,
 *  siteDescription: string,
 *  siteUrl: string,
 *  authorName: string,
 *  authorUrl: string,
 *  authorImgUrl: string
 *  layout: string,
 *  publishDate: string
 *  title: string
 * }>} */
export default ({
  vars: {
    siteUrl
  }
}) => `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
