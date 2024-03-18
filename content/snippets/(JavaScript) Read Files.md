## List all files in a directory in Node.js recursively

- Node v20.1+

```javascript
const fileList = fs.readdirSync(dir, { recursive: true });
```

- by using [glob](https://www.npmjs.com/package/glob)

```javascript
const glob = require('glob');

glob('posts/**/*.md', (err, files) => {
  console.log({ files });

  /*
   * will produce:
   * {
   *     files: [
   *       'posts/CategoryOne/markdown-one-1.md',
   *       'posts/CategoryOne/markdown-one-2.md',
   *       'posts/CategoryOne/markdown-one-3.md',
   *       'posts/CategoryTwo/markdown-two-1.md',
   *       'posts/CategoryTwo/markdown-two-2.md',
   *       'posts/CategoryTwo/markdown-two-3.md'
   *     ]
   * }
   */
});
```
