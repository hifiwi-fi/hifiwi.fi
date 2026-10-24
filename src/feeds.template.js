/**
 * @import { DataDeps, TemplateAsyncIterator } from '@domstack/static/types.js'
 * @import { FeedData } from './global.data.js'
 */
import jsonfeedToAtom from 'jsonfeed-to-atom'

/** @satisfies {DataDeps<FeedData>} */
export const dataDeps = ['feedItems']

/** @type {TemplateAsyncIterator<{
 *  siteName: string,
 *  siteDescription: string,
 *  siteUrl: string,
 *  authorName: string,
 *  authorUrl: string,
 *  authorImgUrl: string
 *  layout: string,
 *  publishDate: string
 *  title: string
 * }, FeedData>} */
export default async function * feedsTemplate ({
  vars: {
    siteName,
    siteDescription,
    siteUrl,
    authorName,
    authorUrl,
    authorImgUrl
  },
  data
}) {
  const jsonFeed = {
    version: 'https://jsonfeed.org/version/1',
    title: siteName,
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/feed.json`,
    description: siteDescription,
    author: {
      name: authorName,
      url: authorUrl,
      avatar: authorImgUrl
    },
    items: data.feedItems
  }

  yield {
    content: JSON.stringify(jsonFeed, null, '  '),
    outputName: 'feed.json'
  }

  const atom = jsonfeedToAtom(jsonFeed)

  yield {
    content: atom,
    outputName: 'feed.xml'
  }

  yield {
    content: atom,
    outputName: 'atom.xml'
  }
}
