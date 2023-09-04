import { html, render } from 'uland-isomorphic'

export default function rootLayout ({
  title,
  siteName,
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
      <link rel="shortcut icon" href="/favicon.ico">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="48x48" href="/favicons/favicon-48x48.png">

      <link rel="alternate" title="bret.io (JSON Feed)" type="application/json" href="/feed.json" />
      <link rel="alternate" title="bret.io (JSON Feed)" type="application/feed+json" href="/feed.json" />
      <link rel="alternate" title="bret.io (RSS Feed)" type="application/rss+xml"  href="/feed.xml" />

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
        </footer>
      </div>
    </body>
    </html>
`)
}
