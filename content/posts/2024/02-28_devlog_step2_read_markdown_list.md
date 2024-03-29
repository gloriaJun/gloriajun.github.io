---
title: '(DevLog) Step2: Generate Content List by reading markdown files'
tags:
  - nextjs
  - devlog
createdAt: 2024-02-28 23:35
updatedAt: 2024-03-19 00:27
---

이제 obsidian으로 작성한 마크다운 파일을 읽어오기 위한 부분을 구현하려고 한다.

## 파일 리스트를 읽어오기

작성된 로컬의 파일의 리스트들을 읽어와서 화면에 그려주도록 하기 위한 부분을 구현하기 위한 과정이다.

### 플러그인 설치

markdown 파일의 메타 데이터를 분석하기 위한 플러그인을 설치하였다.

- turborepo를 이용한 monorepo 구조이고, doc 패키지에만 설치하기 위해 다음과 같이 실행하였다.

```bash
pnpm add --filter docs gray-matter
```

해당 플러그인은 markdown의 `---` 사이에 작성된 다음과 같은 정보를 읽어서 객체로 파싱해주는 역할을 한다.

```bash
---
title: (Storybook) 스토리 계층 구조 설정하기
tags:
createdAt: 2024-02-06 17:16
updatedAt: 2024-02-06 17:16
---
```

### 파일 시스템을 읽기 위한 함수 정의

로컬 파일 시스템에 작성된 마크다운 파일 목록을 읽어오기 위한 함수를 정의한다.

```typescript
// libs/post.ts
import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), './posts');
const markdownExtension = '.md';

type FrontMatter = {
  title: string;
  tags: string[];
  createAt: string;
  updateAt: string;
};

function getMarkdownContent(file: string) {
  // Read markdown file as string
  const fullPath = path.join(postsDirectory, file);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  return matter(fileContents);
}

export function getAllPostData() {
  // Get file names under the post root directory
  const fileList = fs.readdirSync(postsDirectory, { recursive: true });

  const allPostsData: Array<
    FrontMatter & {
      id: string;
      encodedId: string;
    }
  > = fileList
    .map((file) => {
      if (
        typeof file !== 'string' ||
        markdownExtension !== path.extname(file)
      ) {
        return;
      }

      // Remove ".md" from file name to get id
      const id = file.replace(new RegExp(`${markdownExtension}$`), '');
      const matterResult = getMarkdownContent(file);

      return {
        id,
        encodedId: encodeURIComponent(id),
        ...(matterResult.data as FrontMatter),
      };
    })
    .filter((data) => !!data);

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.createAt < b.createAt) {
      return 1;
    } else {
      return -1;
    }
  });
}
```

`posts/dir01/test.md`와 같은 폴더 구조에 대해서도 파일을 읽어오기 위해서 아래와 같은 옵션을 주어 파일을 읽어오도록 정의하였다.

```javascript
fs.readdirSync(postsDirectory, { recursive: true });
```

### post 리스트를 화면에 그리기 위한 컴포넌트 정의

```typescript
// pages/index.tsx
import Link from 'next/link';

import { getAllPostData } from '@/libs/post';

export function getStaticProps() {
  const allPostsData = getAllPostData();

  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({
  allPostsData,
}: {
  allPostsData: ReturnType<typeof getAllPostData>;
}) {
  return (
    <div>
      <h1>Home</h1>
      <p>
        Visit the <Link href="/about">About</Link> page.
      </p>

      <section>
        <h2>Blog List</h2>
        <ul>
          {allPostsData.map((item) => (
            <li key={item.id}>
              <h4>{item.title}</h4>
              <p>tags: {item.tags.toString()}</p>
              <p>date: {item.createdAt}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

서버를 실행해서 보면 다음과 같이 파일 목록을 읽어와서 출력이 되는 것을 확인할 수 있다.
![[02-28_devlog_post_list.png]]

## 참고했던 글들...

- [Next.js - Creating a simple blog architecture](https://nextjs.org/learn-pages-router/basics/data-fetching/blog-data)
