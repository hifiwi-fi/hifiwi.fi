# Agent instructions

## Type imports

- In typed JavaScript, declare all type-only dependencies with JSDoc `@import` declarations in a block at the top of the file, before runtime imports.
- Never use inline `import(...)` type expressions.

```js
/**
 * @import { LayoutFunction } from '@domstack/static'
 * @import { HtmlResult } from 'fragtml/types.js'
 */
```
