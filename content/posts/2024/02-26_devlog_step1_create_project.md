---
title: '(DevLog) Step1: Create Project'
tags:
  - pnpm
  - nextjs
  - devlog
createdAt: 2024-02-26 22:36
updatedAt: 2024-02-26 22:36
---

완전 개발 블로구 도구 유목민인 듯...하지만....(이 과정에도 삽질의 배움이 있겠지...하고 받아들이는 중이다...)
아직도 어딘가 확실하게 정착하지 못하고 이것 저것 찍먹만 열심히 하는 것 같기도 하지만...

jekeyll을 거쳐서 gatsby로 갔다가.....[docusaurus](https://docusaurus.io) 를 알게 되고서는 gatsby가 무거운 듯도 하여 해당 도구로 migration 했다가....obsidian을 알고 사용하게 되면서....

- 먼가 docusarus는 너무 매뉴얼 같은 느낌이 강한 것 같아....난 그런 걸 원한게 아니었는데??
- 생태계가 무언가를 확장하고 내 맘대로 시도해보기엔 제약이 좀 있는 것 같은 느낌이랄까...?
- gatsby도 써보았을 때에...확 끌리는 맛도 없고..

이러한 상태에서 이것 저것 검색을 해보다보니..요즘은 웹사이트 정적도구를 이용하지 않고 next.js를 이용하여서도 구성을 하는 것 같았다.
next.js에서 제공하는 SSG 기능을 이용하여 정적 HTML 파일을 빌드 시에 생성하여 서빙하는 형태의..

이것을 보고서는 "오호!! 이거로구나!! 요즘 next.js를 찍먹해보고 싶기도 했는데....어짜피 css나 블로그 ux라던가 디자인도 생각해보는 공부도 해볼겸...."

각설하고 다음의 과정은 레포 생성 부터의 나의 삽질 기록들이다...

## turborepo를 이용해서 monorepo 구조로 시작해보자.

개인 개발 블로그 용도로는 monorepo 구조가 크게 필요가 없을 수 있지만, 블로그 내부에서 사용하게 되는

- ui component
- utility 함수

이러한 부분을 동일한 패키지 내부가 아닌 외부에 정의하여 라이브러리 형태로 만들고 가져다 사용하는 형태로 구성해보고 싶었다.
물론 이 과정에서 삽질이 좀 필요하기도 하겠지만 말이다...

#### 왜 turborepo를 선택하였는지...

NX도 monorepo를 위한 관리도구로 많이 사용되고 있기는 한데...
문서를 읽거나 업무에서 사용해보았을 때에 기본적인 설정과 다른 부분들이 있기도 해서 인가...그냥 하나의 새로운 도구라는 느낌이 강했다.
많은 것들은 제공하기는 하지만...monorepo 관리를 위한 하나의 거대한 프레임워크라는 느낌이랄까...
나는 좀 더..

- 러닝커브가 낮았으면 했고
- 기존 모노레포와 관리 방식에 크게 이질감이 없었으면...
- 가벼운 느낌...
- 다른 도구들과 연동하고자 할 때 좀 더 nx 도구에 의존성이 높지 않았으면...
- 모든 package 모듈에서 공통으로 사용되는 부분만 root의 package.json에서 관리하는 형태였으면...

이러한 나의 생각들을 고려했을 때는 turborepo가 좀 더 사용해보고 싶었고, 내 목적에는 적합한 것 같았다.

#### turborepo를 이용하여 monorepo 구성하기

다음과 같은 명령어를 이용하여 프로젝트를 생성한다.

```bash
npx create-turbo@latest
```

어떠한 패키지 매니저를 사용할 것인지에 대한 선택지가 나오는데...
pnpm을 사용해보고자 하므로 해당 옵션을 선택!

```bash
Need to install the following packages:
create-turbo@1.12.5
Ok to proceed? (y)

>>> TURBOREPO

>>> Welcome to Turborepo! Let's get you set up with a new codebase.

? Where would you like to create your turborepo? pnpm-turbo-repo
? Which package manager do you want to use?
  npm workspaces
❯ pnpm workspaces
  yarn workspaces
  - bun workspaces (beta) (not installed)
```

설치가 완료되면 turborepo에서 모노레포 폴더 구조로 프로젝트를 생성해준다.

위와 같이 구성을 하고나면...다음과 같은 구조로 구성이 된다.

```bash
├── README.md
├── apps
│   ├── docs
│   │   ├── README.md
│   │   ├── app
│   │   ├── next-env.d.ts
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── public
│   │   └── tsconfig.json
│   └── web
│       ├── README.md
│       ├── app
│       ├── next-env.d.ts
│       ├── next.config.js
│       ├── package.json
│       ├── public
│       └── tsconfig.json
├── package.json
├── packages
│   ├── eslint-config
│   │   ├── README.md
│   │   ├── library.js
│   │   ├── next.js
│   │   ├── package.json
│   │   └── react-internal.js
│   ├── typescript-config
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   ├── package.json
│   │   └── react-library.json
│   └── ui
│       ├── package.json
│       ├── src
│       ├── tsconfig.json
│       ├── tsconfig.lint.json
│       └── turbo
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── turbo.json
```

## Next.js를 이용하여 markdown 파일을 읽어오자

turborepo에서 기본으로 생성된 `apps/docs` 패키지를 그대로 이용해서 수정해가며 만들 계획이다.

### App Router vs Page Router 방식 어떤 것을 적용할까?

Next.js v13 부터는 React Server Component를 지원하는 App Route가 정식으로 지원이 되는데..
next.js를 처음 사용해보기도 하다보니, 좀 더 참고 자료가 많은 Page Router 방식을 사용하기로 하였다.
그리고 직접 Page Router 방식을 적용 후에 todo 와 같은 앱을 만들어 보며 비교 경험해보는 것이 어떨까 싶기도 하고..

### page Router 를 이용한 기본 구조 정의

`apps/docs/app` 디렉토리를 제거하고 `apps/docs/pages` 폴더를 생성한 뒤 다음과 같은 파일들을 생성해주었다.

```typescript
// pages/index.tsx
import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <p>Hello World! This is the Home page</p>
      <p>
        Visit the <Link href="/about">About</Link> page.
      </p>
    </div>
  );
};

export default Home;

// pages/about.tsx
import Link from 'next/link';

const About = () => {
  return (
    <div>
      <h1>About</h1>
      <p>Now you are on the About page!</p>
      <p>
        Go back to the <Link href="/">Home</Link> page.
      </p>
    </div>
  );
};

export default About;
```

이후에 다음과 같이 서버를 실행 시키면 작성환 페이지들을 확인할 수 있다.

```bash
pnpm run dev --filter docs
```

## 참고했던 글들...

- [Next.js의 렌더링 방식 이해하기 - SSR, SSG, ISR](https://enjoydev.life/blog/nextjs/1-ssr-ssg-isr
