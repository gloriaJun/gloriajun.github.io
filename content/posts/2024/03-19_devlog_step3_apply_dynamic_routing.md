---
title: '(DevLog) Step3: Read markdown content with dynamic routing'
tags:
  - nextjs
  - devlog
createdAt: 2024-03-19 00:46
updatedAt: 2024-03-30 20:38
---

## 동적으로 라우팅으로 id에 따른 markdown 파일 읽어오기

[[02-28_devlog_step2_read_markdown_list]]에서 파일 리스트들을 읽어왔으니, 이번에는 동적으로 post 라우팅을 구성하고 path parameter로 전달된 id에 해당하는 마크다운 파일을 가져오기 위한 부분을 구현하려고 한다.

일단 작성된 markdown 파일들은 다음과 같은 구조로 되어있어, 폴더 내부에 위치한 파일들도 읽어올 수 있도로 하고자 한다.

```bash
test01/unit-test.md
test01/test123.md
test01/test01-01/test111.md
test02/test23.md
```

동적으로 생성된 routing에서 참조하기 위해 `pages/posts/[[...id]].tsx` 파일을 생성한다.

### 파일 목록의 아이디를 읽어와서 쿼리 파라미터 생성하기

위에서 작성한 파일에 각 파일들의 `id`를 읽어와서 url path parameter로 생성하고, 각 폴더를 기준으로 split 하였다.

```typescript
// pages/posts/[[...id]].tsx

import type { GetStaticPaths } from 'next';

import { getAllPostData } from '@/libs/post';
import { PostParams } from '@/types/post';

export const getStaticPaths = (() => {
  const paths = getAllPostData().map((file) => {
    return {
      params: {
        id: file.id.split('/'),
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}) satisfies GetStaticPaths<CPostParams>;
```

생성된 id 기준으로 동적으로 생성된 반환 값의 구조는 다음과 같다.

```json
{
  "paths": [
    { "params": { "id": ["test01", "unit-test"] } },
    { "params": { "id": "devlog_step1" } }
  ],
  "fallback": false
}
```

### path parameter를 통하여 전달된 `id`에 해당하는 markdown 파일 읽어오기

pathparameter로 전달된 markdown 데이터를 읽어오기 위한 함수를 정의한다.

```typescript
// libs/posts.tx

//...SKIP...
import { FrontMatter, PostContentData, PostParams } from '@/types/post';

//...SKIP...
const markdownExtension = '.md';

//...SKIP...

const getMarkdownContent = ((file) => {
  // Read markdown file as string
  const fullPath = path.join(postsDirectory, file);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const { data, ...matterResult } = matter(fileContents);

  return {
    data: data as FrontMatter,
    ...matterResult,
  };
}) satisfies (
  file: string,
) => Omit<ReturnType<typeof matter>, 'data'> & { data: FrontMatter };

//...SKIP...

export const getPostData = ((ids) => {
  const id = Array.isArray(ids) ? ids.join('/') : ids;
  const matterResult = getMarkdownContent(`${id}${markdownExtension}`);

  return {
    id,
    content: matterResult.content,
    ...matterResult.data,
  };
}) satisfies (ids: ValueOfType<PostParams, 'id'>) => PostContentData;
```

이제 가져온 데이터를 화면에 그리기 위한 부분을 다음과 같이 정의해주었다.

```typescript
// pages/posts/[[...id]].tsx

export const getStaticProps = ((props) => {
  const postData = getPostData(props.params!.id);

  return {
    props: {
      postData,
    },
  };
}) satisfies GetStaticProps<
  {
    postData: PostContentData;
  },
  PostParams
>;

export default function Post({
  postData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <section>
      <h2>{postData.title}</h2>
      <p>
        {[postData.createdAt, postData.updatedAt].map((date, index) => (
          <span key={index}>{dayjs(date).format()}</span>
        ))}
      </p>

      {/* <div>{postData.content}</div> */}
    </section>
  );
}
```

#### markdown content를 html로 변환하여 출력하기

markdown content를 렌더링 하기 위해 `[remark](https://github.com/remarkjs/remark)`라이브러리를 설치한다.

```bash
pnpm add --filter <app_name> remark remark-html
```

그리고 앞에서 작성한 `libs/post.ts`의 `getPostData` 함수에 다음과 같은 내용을 추가한다.

```typescript
// libs/posts.tx

//...SKIP

export const getPostData = ((ids) => {
  const id = Array.isArray(ids) ? ids.join('/') : ids;
  const matterResult = getMarkdownContent(`${id}${markdownExtension}`);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    content: contentHtml,
    ...matterResult.data,
  };
}) satisfies (ids: ValueOfType<PostParams, 'id'>) => PostContentData;
```

html string으로 변환된 내용을 `<div dangerouslySetInnerHTML={{ __html: postData.content }} />`와 같이 사용하여 화면에 출력할 수도 있지만...
이와 같이 사용하는 방법은 [cross-site scripting (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) 공격에 취약하여 권장되지 않는 방법이므로 [html-react-parser](https://github.com/remarkablemark/html-react-parser) 라이브러리를 이용하였다.

```bash
pnpm add --filter <app_name> html-react-parser
```

전달된 html content 출력을 위해 아래와 같이 작성하였다.

```typescript
// pages/posts/[[...id]].tsx

import htmlParse from 'html-react-parser';

//...SKIP

export default function Post({
  postData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <section>
      <h2>{postData.title}</h2>
      <p>
        {[postData.createdAt, postData.updatedAt].map((date, index) => (
          <span key={index}>{dayjs(date).format()}</span>
        ))}
      </p>
      <div>{htmlParse(postData.content)}</div>
    </section>
  );
}
```

## 참고했던 글들...

- [Next.js - Dynamic Routes](https://nextjs.org/learn-pages-router/basics/dynamic-routes/page-path-external-data)
- https://github.com/xypnox/next-nested/blob/main/lib/docs.js
- [How to render HTML string in React](https://medium.com/@uigalaxy7/how-to-render-html-in-react-7f3c73f5cafc)
