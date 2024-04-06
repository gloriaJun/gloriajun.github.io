---
title: '(DevLog) Step4: Deploy to `gh-pages`'
tags:
  - nextjs
  - devlog
  - '#github-action'
  - gh-pages
createdAt: 2024-03-30 20:56
updatedAt: 2024-03-30 21:22
---

Next.js로 구현한 개인 블로그를 배포를 연동해보려고 한다.
Next.js를 이용하여 배포를 할 수 있는 방법은 여러 방법이 있지만 그 중에 **Vercel, Github page** 둘 중에 어떠한 방법을 사용할 지 고민을 하게 되었다

단순히 내가 생각해보았을 때에는..

- Vercel
  - Next.js와 궁합이 좋은 느낌? 좀 더 손쉽게 배포를 할 수 있을 것 같았다
  - 근데, Vercel 사이트 가입도 하고 관리도 해야할 것 같기도...
- Github page
  - 어짜피 사용하는 github 자연스럽게 관리가 되지 않을까?
  - Github Action을 경험할 수 있다. 근데...설정 과정의 허들??

결론은 좀 더 번거롭더라도 Github page로 배포를 하고 관리하는 것이 현재의 나에게는 효율적일 듯하여 이 방향으로 조사를 하였다.

## Configure the Next.js Build Process

기본적으로 Next.js에서는 Node.js를 사용하여 어플리케이션을 실행하고 있으므로 GitHub Page를 이용하여 정적 파일을 호스팅 하도록 하기 위해서는 정적 페이지를 생성하도록 하기 위해 빌드 산출물 생성 방식에 대한 설정을 수정해주어야 한다.

이 부분은 `next.config.js` 파일의 **[output](https://nextjs.org/docs/pages/api-reference/next-config-js/output)** 옵션을 이용하여 설정할 수 있다.

```javascript
// next.config.js

/** @type {import('next').NextConfig} */
module.exports = {
  // enable static export
  output: 'export',
  transpilePackages: ['@repo/ui'],
};
```

이와 같이 적용 후 다음과 같이 빌드를 실행해보면 `out` 폴더에 산출물이 생성되는 것을 확인할 수 있다.

```bash
> pnpm run build --filter devlog
// ...SKIP...(빌드 과정에 대한 로그들..)

❯ ls -al ./apps/devlog/out                                                                                                                                           14:36:00
total 56
drwxr-xr-x@ 10 user  staff   320 Apr  6 14:36 .
drwxr-xr-x@ 17 user  staff   544 Apr  6 14:35 ..
-rw-r--r--@  1 user  staff  2144 Apr  6 14:36 404.html
drwxr-xr-x@  5 user  staff   160 Apr  6 14:36 _next
-rw-r--r--@  1 user  staff  1089 Apr  6 14:35 circles.svg
-rw-r--r--@  1 user  staff  5909 Apr  6 14:36 index.html
-rw-r--r--@  1 user  staff  1375 Apr  6 14:35 next.svg
drwxr-xr-x@  3 user  staff    96 Apr  6 14:36 posts
-rw-r--r--@  1 user  staff  3814 Apr  6 14:35 turborepo.svg
-rw-r--r--@  1 user  staff   629 Apr  6 14:35 vercel.svg
```

## Configure a base path

기본적으로 링크 생성 시에 `<a href="/posts/2024/03-21_typescript_tips">` 와 같이 이미지 파일의 경로 또는 다른 페이지들에 대한 경로가 생성이 되고 있으므로 올바른 경로로 찾도록 하기 위해 basePath를 설정해주어야한다.

배포하고자 하는 `gh-pages`의 주소가 [gloriajun.github.io/gloria-devlog/](https://gloriajun.github.io/gloria-tilog/ 'https://gloriajun.github.io/gloria-devlog/')와 같으므로 아래와 같이 설정을 추가 해주었다.

```javascript
// next.config.js

/** @type {import('next').NextConfig} */
module.exports = {
  basePath: process.env.NODE_ENV === 'production' ? '/gloria-devlog' : '',
  // enable static export
  output: 'export',
  transpilePackages: ['@repo/ui'],
};
```

## Configure GitHub Action

GitHub Action을 위해 배포하기 위해서 workflow를 작성해준다.

먼저, node 빌드 환경 셋업을 위한 스크립트를 아래와 같이 작성해주었다.

```yaml
// .github/workflows/setup/action.yml

name: setup

runs:
  using: 'composite'
  steps:
    - name: Read .nvmrc
      shell: bash
      run: echo "NODE_VERSION=$(cat .nvmrc)" >> $GITHUB_OUTPUT
      id: nvm

    - name: Enable corepack
      shell: bash
      run: corepack enable

    - name: Use Node.js ${{ steps.nvm.outputs.NODE_VERSION }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ steps.nvm.outputs.NODE_VERSION }}
        cache: 'pnpm'

    - name: Install dependencies
      shell: bash
      run: pnpm install

```

해당 스크립트는 차후, 다른 ci 스크립트에서도 재사용할 수 있도록 별도로 분리하였고, 반드시 파일명은 `action.yml` 로 생성해주어야한다.

그리고 배포를 위한 스크립트 부분을 아래와 같이 작성하였다.

```yaml
// .github/workflows/deploy.yml

name: GitHub Pages deploy

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

env:
  app_output_dir: ./apps/devlog/out

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        uses: ./.github/workflows/setup

      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: next

      - name: Build my App
        run: pnpm run build --filter devlog && touch ${{ env.app_output_dir }}/.nojekyll

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ${{ env.app_output_dir }}

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Publish to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Activate GitHub Pages

배포하고자 하는 Repo의 **Settings > Pages** 에서 **Build and deployment** 항목의 **Source** 부분을 `GitHub Actions` 로 설정을 해주고, 수정된 내용을 `main` 브랜치로 push 한다.
그러면, `Actions` 탭에서 정의한 스크립트에 따라 실행이 되는 것을 확인할 수 있다.

## 참고했던 글...

- [How to Deploy Next.js Apps to Github Pages](https://www.freecodecamp.org/news/how-to-deploy-next-js-app-to-github-pages/)
