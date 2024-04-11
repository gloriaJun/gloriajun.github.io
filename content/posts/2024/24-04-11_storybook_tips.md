---
title: (Storybook) Useful Tips to write a story
tags:
  - '#storybook'
createdAt: 2024-04-11 18:58
updatedAt: 2024-04-11 18:58
---

> 스토리북을 활용하면서 기록해두고 싶은 것들을 정리해나가는 중입니다.

## Argument

story의 `render` 를 이용해서 속성 정보를 업데이트하기 위해 `useState`와 같은 hook을 사용하여 다음과 같이 코드를 작성한 경우,

```typescript
import React, { useState } from 'react';

//...SKIP

render: function Render({ ...args }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setOpen(!open);
        }}>
        Click
      </button>

      {open.toString()}
    </div>
  )
},
```

아래와 같은 Lint 에러를 만나게 된다.

```bash
ESLint: React Hook "useState" is called in function "render" that is neither a React function component nor a custom React Hook function. React component names must start with an uppercase letter. React Hook names must start with the word "use".(react-hooks/rules-of-hooks)
```

이와 같은 이슈를 피하기 위해서 스토리북 문서에서는 아래와 같이 `useArgs` API를 이용하는 것을 가이드한다.

- [Storybook Doc > Args > Setting args from within a story](https://storybook.js.org/docs/writing-stories/args#setting-args-from-within-a-story)

```typescript
import { useArgs } from '@storybook/preview-api';

//...SKIP

/**
 * 👇 To avoid linting issues, it is recommended to use a function with a capitalized name.
 * If you are not concerned with linting, you may use an arrow function.
*/
render: function Render({ ...args }) {
  const [{ open }, updateArgs] = useArgs();

  return (
    <div>
      <button
        onClick={() => {
          updateArgs({ open: true });
        }}>
        Click
      </button>

      {open.toString()}
    </div>
  )
},
```
