# Contributing

## Development setup

```
npm install
npm start
npm run build
```

## Site framework and styles

The site uses DOMstack v12 (currently pinned to `12.0.0-beta.10`) and requires Node.js 24+ and npm 11+.

The defaults are ejected: `src/layouts/root.layout.js` owns the document shell, and `src/globals/global.css` owns the Mine CSS v11, layout, and light/dark syntax-highlighting imports. `defaultStyle: false` in `src/globals/global.vars.js` disables the bundled defaults. Update these local files explicitly when adopting future default-style changes. Mine CSS follows the browser's color preference and requires native CSS nesting support.

Blog listings, feeds, and the sitemap receive explicitly subscribed collections from `src/global.data.js`. Nested layouts declare `parentLayout` so DOMstack includes their ancestor assets automatically.

The global-data producer uses DOMstack's `changes`, `previousState`, and `setState` hooks for progressive watch rebuilds. It retains structured-cloneable metadata keyed by `sourceId`, removes deleted sources, and invalidates cached feed HTML only for upserted pages. Unchanged feed articles reuse their rendered HTML; a reset rebuilds the cache. DOMstack fingerprints the published data keys and rebuilds only affected `dataDeps` subscribers. Keep page instances and render functions out of retained state.

Run `npm test` to check lint, types, unit tests, and the production build. Run `npm run test:unit` for the global-data reset/delta regression tests. After stylesheet updates, visually check the home page, blog indexes, and articles in light/dark modes and at mobile/desktop widths.

## Favicons

Run `npm run generate-icon` after changing the logo. `favicon-config.js` selects the local blue logo and the manila background for Apple touch icons. `scripts/generate-icons.js` regenerates the PNG/ICO set in `src/favicons/` and synchronizes the root `src/favicon.ico` fallback. No Gravatar request is needed.

## Browser verification

Install the Playwright browsers once, then run the separate browser suite:

```sh
npx playwright install chromium webkit
npm run browser:test
npm run browser:report
```

On Linux CI, use `npx playwright install --with-deps chromium webkit` to install browser system dependencies too. Browser checks are intentionally separate from `npm test`.

`playwright.config.js` starts and stops a production DOMstack preview on port 4173. The suite in `tests/site.spec.js` checks all six pages in Chromium and WebKit at desktop (1440×1000) and mobile (390×844) sizes, in light and dark modes. It verifies local responses, browser errors, image loading, horizontal overflow, theme variables, stylesheet ownership, and visible keyboard focus. External requests are stubbed so tests do not send analytics or depend on third-party availability.

Each run saves full-page screenshots under `test-results/` and attaches them to the HTML report in `playwright-report/`; both directories are ignored by Git. These are screenshots for manual review, not approved pixel-diff baselines. Mobile projects emulate a mobile viewport/touch environment, not physical devices.

## Guidelines

- Patches, ideas and changes welcome.
- Fixes almost always welcome.
- Features sometimes welcome.
  - Please open an issue to discuss the issue prior to spending lots of time on the problem.  
  - It may be rejected.  
  - If you don't want to wait around for the discussion to commence, and you really want to jump into the implementation work, be prepared for fork if the idea is respectfully declined.
- Try to stay within the style of the existing code.
- All tests must pass.
- Additional features or code paths must be tested.
- Aim for 100% coverage.
- Questions are welcome, however unless there is a official support contract established between the maintainers and the requester, support is not guaranteed.
- Contributors reserve the right to walk away from this project at any moment with or without notice.

## Releasing

Changelog generation and releasing are automated with npm scripts and GitHub Actions. To create a release:

- Navigate to the Actions tab.
- Select the `Version and Release` workflow.
- Trigger the workflow, specifying the semantic version bump that is needed.
- The changelog, version commit, tag, and GitHub release are handled by the workflow.
- An in depth review of this system is documented here: [bret.io/projects/package-automation](https://bret.io/projects/package-automation/)

If the workflow is unavailable or a local release is preferred, follow these steps:

- Ensure a clean working tree.
- Run `npm version {patch,minor,major}`.
  - This updates the version number and generates the changelog with [Releasearoni](https://github.com/bcomnes/releasearoni).
- Run `npm run release`.
  - This builds the site, pushes the version commit and tag, and creates the GitHub release.
