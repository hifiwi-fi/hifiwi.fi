import { html, render } from 'uland-isomorphic'

/**
 * @template T
 * @typedef {import('top-bun').LayoutFunction<T>} LayoutFunction
 */

/**
 * @typedef {{
 *  title: string,
 *  siteName: string,
 *  mastodonUrl: string,
 *  discordUrl: string
 * }} RootLayoutVars
 */

/** @type {LayoutFunction<RootLayoutVars>} */
export default function rootLayout ({
  vars: {
    title,
    siteName,
    mastodonUrl,
    discordUrl
  },
  scripts,
  styles,
  children
}) {
  return render(String, html`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title ? `${title}` : ''}${title && siteName ? ' | ' : ''}${siteName}</title>
      <meta name="viewport" content="width=device-width, user-scalable=no" />

      <link rel="icon" type="image/x-icon" href="/favicons/favicon.ico">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="48x48" href="/favicons/favicon-48x48.png">
      <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-touch-icon-57x57.png">
      <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-touch-icon-60x60.png">
      <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-touch-icon-72x72.png">
      <link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-touch-icon-76x76.png">
      <link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-touch-icon-114x114.png">
      <link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-touch-icon-120x120.png">
      <link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-touch-icon-144x144.png">
      <link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-touch-icon-152x152.png">
      <link rel="apple-touch-icon" sizes="167x167" href="/favicons/apple-touch-icon-167x167.png">
      <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon-180x180.png">
      <link rel="apple-touch-icon" sizes="1024x1024" href="/favicons/apple-touch-icon-1024x1024.png">

      <link rel="alternate" title="HifiWi.fi (JSON Feed)" type="application/json" href="/feed.json" />
      <link rel="alternate" title="HifiWi.fi (JSON Feed)" type="application/feed+json" href="/feed.json" />
      <link rel="alternate" title="HifiWi.fi (RSS Feed)" type="application/rss+xml"  href="/feed.xml" />

      ${scripts
        ? scripts.map(script => html`<script type='module' src="${script}"></script>`)
        : null}
      ${styles
        ? styles.map(style => html`<link rel="stylesheet" href=${style} />`)
        : null}
    </head>
    <body class="safe-area-inset">
      <div class="mine-layout">
        <main>
          ${typeof children === 'string' ? html([children]) : children /* Support both uhtml and string children. Optional. */}
        </main>      
        <footer>
          © <a href="/">HifiWifi</a>
          <a href="/feed.json"><img class="rounded-icon" height="14" width="14" src="/media/jsonfeed.svg"></a>
          <a href="/feed.xml"><img height="14" width="14" src="/media/rss.svg" ></a>
          <a href="${mastodonUrl}" rel="me"><img height="14" width="14" src="/media/mastodon.svg"></a>
          <a href="${discordUrl}" rel="me"><img height="14" width="14" src="/media/discord.svg"></a>
        </footer>
      </div>
    </body>
    </html>
`)
}
