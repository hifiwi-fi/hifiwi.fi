import { html, render } from 'uland-isomorphic'

export default function rootLayout ({
  title,
  siteName = 'Siteup',
  defaultStyle = true,
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
      ${scripts
        ? scripts.map(script => html`<script type='module' src="${script}"></script>`)
        : null}
      ${styles
        ? styles.map(style => html`<link rel="stylesheet" href=${style} />`)
        : null}
      ${defaultStyle
        ? html`
            <link rel="stylesheet" href="https://unpkg.com/mine.css@^4/dist/mine.css" />
            <link rel="stylesheet" href="https://unpkg.com/mine.css@^4/dist/layout.css" />
            <link rel="stylesheet" href="https://unpkg.com/highlight.js@^11/styles/github-dark-dimmed.css" />
            <script>
              import { toggleTheme } from 'https://unpkg.com/bcomnes/mine.css@^4.0.0?module';
              window.toggleTheme = toggleTheme
            </script>
            `
        : null}
    </head>
    <body class="safe-area-inset">
      <main class="mine-layout">
        ${typeof children === 'string' ? html([children]) : children /* Support both uhtml and string children. Optional. */}
      </main>
    </body>
    </html>
`)
}
