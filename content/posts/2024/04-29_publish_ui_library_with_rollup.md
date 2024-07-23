---
title: (React) Create Publishable React Library with rollup
tags:
createdAt: 2024-04-29 10:46
updatedAt: 2024-04-30 00:40
---

## rollup 번들러에 대하여 간략히 조사해보기

- 다음의 링크를 통해서 각 옵션에 대한 번들링 결과물 예시를 비교해볼 수 있다.
  - https://rollupjs.org/repl/?version=4.17.0
- 라이브러리 빌드 목적으로 다음과 같은 이점이 있어 많이 사용하고 있는 것으로 보여진다.
  - esm 포맷으로 번들링 결과물을 출력해준다.
- tree shaking이 지원된다.

### 왜 webpack을 선택하지 않았을까?

검색해보니..다음과 같은 결론을 내릴 수 있었다.

- webpack에서는 ESM 번들이 어렵다. 또는 완벽하게 잘 지원이 되지 않는다.
- webpack을 이용한 설정은 복잡하다.
- rollup이 webpack 대비 빌드 결과물이 가볍다.
- webpack보다 tree shaking을 잘 지원한다.

## 번들링 파일 format 방식

요즘 주로 `cjs, esm` 모듈 형태로 번들링하여 배포하는 추세인 것 같아 아래의 두 모듈에 대해서만 정리해보았음.

### cjs (CommonJS)

- NodeJS에서 지원하는 모듈 시스템
- 보통 `require`를 통하여 불러온다.
  - 동기적으로 불러옴

### esm (ECMAScript Modules)

- ECMAScript에서 지정한 표준 모듈 시스템
- 빌드 단계에서 사용하지 않는 모듈에 대한 tree shaking이 가능하다
- 브라우저 환경에서 실행 가능
- 비동기적으로 모듈을 불러온다 (?)

모듈을 제공할 때 위의 두 가지 방식을 모두 지원하면 호환성 이슈를 해결할 수 있다
`package.json`의 **exports** 필드를 이용하여 정의하면

- cjs 환경에서는 cjs로 번들링된 모듈을, esm 환경에서는 해당 모듈을 불러오게 된다.

## Create Component Library

monorepo 구조로 **turborepo** 를 관리도구로 사용하고 있었고, rollup을 위한 빌드 테스트를 위해서 다음과 같은 구조에 테스트용 컴포넌트를 생성하였다.

### Directory Structure

폴더 구조를 예를 들면 다음과 같다.

```bash
src/
  ├── button /
	  ├── index.tsx
	  ├── Button.scss
	  └── ...
  └── ...
  └── index.tsx
.eslintrc.js
package.json
tsconfig.json
tsconfig.lint.json
```

### tsconfig.json

tscofnig 설정은 extends 형태로 구성이 되어있으나 종합적으로 설정되는 부분을 정리해보면 다음과 같다.

```json
// tsconfig.json
{
  "compilerOptions": {
    "outDir": "dist",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "incremental": false,
    "isolatedModules": true,
    "lib": ["DOM", "ESNext", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleDetection": "force",
    "moduleResolution": "node",
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext",
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "rollup.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

그리고 빌드 시, 사용하기 위한 config 파일을 아래와 같이 설정해주었다.

```json
// tsconfig.lib.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "declarationDir": "dist/types"
  },
  "exclude": ["rollup.config.ts"]
}
```

### Write Component

SSR 환경을 지원하기 위한 라이브러리로 번들링하는 것을 테스트 하기 위해서 다음과 같은 구조로 컴포넌트를 작성하였다.

```typescript
'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  appName: string;
}

export const Button = ({ children, className, appName }: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={() => alert(`Hello from your ${appName} app!`)}
    >
      {children}
    </button>
  );
};
```

## Build And Packaging with rollup

### Write a configuration file

간단하게 작성된 컴포넌트를 기준으로 다음과 같이 빌드 파일을 작성하였다.

```typescript
// rollup.config.ts
import type { RollupOptions } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { createRequire } from 'node:module';

const currentDate = new Date().toUTCString();
const execPromise = promisify(exec);
let getBannerPromise: Promise<string> | null = null;

function resolve(...args: string[]): string {
  return path.resolve(process.cwd(), ...args);
}

function getPackageJson() {
  const require = createRequire(import.meta.url);
  return require(resolve('package.json'));
}

function getBanner(): Promise<string> {
  return (getBannerPromise ||= Promise.all([
    execPromise('git rev-parse HEAD')
      .then(({ stdout }) => stdout.trim())
      .catch((error) => {
        console.error('Could not determine commit hash:', error);
        return 'unknown';
      }),
    getPackageJson(),
  ]).then(([commitHash, packageJson]) => {
    return `/*  
  @license    ${packageJson.name} v${packageJson.version}  
    ${currentDate} - commit ${commitHash}  
*/`;
  }));
}

export default async function getConfig(): Promise<
  RollupOptions | Array<RollupOptions>
> {
  // const extensions = ['.js', '.jsx', '.ts', '.tsx'];

  const commonJsBuild = {
    onwarn: (warning, warn) => {
      if (
        warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
        /\"use client\"/.test(warning.message)
      ) {
        return;
      }

      warn(warning);
    },
    input: {
      index: 'src/index.ts',
    },
    output: {
      dir: 'dist',
      entryFileNames: '[name].cjs',
      exports: 'named',
      format: 'cjs',
      interop: 'default',
      sourcemap: true,
      banner: getBanner,
    },
    external: ['react/jsx-runtime'],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: 'tsconfig.lib.json',
        compilerOptions: {
          outDir: distDir,
          declarationDir: resolve(distDir, 'types'),
        },
      }),
    ],
  } satisfies RollupOptions;

  const esmBuild = {
    ...commonJsBuild,
    output: {
      ...commonJsBuild.output,
      entryFileNames: '[name].mjs',
      format: 'esm',
      minifyInternalExports: false,
      sourcemap: false,
    },
  } satisfies RollupOptions;

  return [commonJsBuild, esmBuild];
}
```

그리고 아래와 같이 빌드를 실행하면...`use client` 관련한 warning이 발생하지만 빌드를 성공한다.

```bash
> rollup --config rollup.config.ts --configPlugin typescript

src/index.ts → dist...
created dist in 584ms

src/index.ts → dist...
created dist in 430ms
```

#### 번들링에 포함하지 않을 모듈 제거하기

현재 빌드된 산출물을 보면 아래와 같이 불필요한 모듈이 포함되어 빌드된 것을 확인할 수 있다.
즉, `react`, `react-dom` 과 같이 해당 라이브러리를 받아 사용하는 라이브러리의 경우 불필요하게 번들링 파일에 포함시킬 필요는 없다.

이 부분 처리를 위해서 rollup에서는 [external](https://rollupjs.org/configuration-options/#external) 필드를 제공하고 있고, `external: ['react', 'react-dom']` 과 같이 명시적으로 작성하면 된다.

근데, 이러한 부분이 package.json의 peerDependencies에 정의된 부분을 가져와서 제외해주는 역할을 하는 [rollup-plugin-peer-deps-external](https://www.npmjs.com/package/rollup-plugin-peer-deps-external) 플러그인을 정의하여 사용할 수도 있다.

나는 `package.json`을 통해서 모듈을 관리하기 위해 플러그인을 사용하고, 다음과 같이 빌드 파일을 수정하였다.

```typescript
// rollup.config.ts
//...SKIP...
// @ts-ignore
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

//...SKIP...

const pkgPath = resolve('package.json');

//...SKIP...

export default async function getConfig(): Promise<
  RollupOptions | Array<RollupOptions>
> {

//...SKIP...

    // external: [], // use peerDepsExternal instead
    plugins: [
      peerDepsExternal({
        packageJsonPath: pkgPath,
      }),

//...SKIP...
```

위와 같이 수정 후에 빌드를 해보면 빌드 사이즈가 확연히 줄어든 것을 확인할 수 있다

```bash
# 제거 전
ls -al packages/ui/dist
total 1080
drwxr-xr-x   7 user  staff     224 Apr 29 21:54 .
drwxr-xr-x  14 user  staff     448 Apr 29 21:54 ..
-rw-r--r--   1 user  staff  146883 Apr 29 21:54 index.cjs
-rw-r--r--   1 user  staff  249486 Apr 29 21:54 index.cjs.map
-rw-r--r--   1 user  staff  146797 Apr 29 21:54 index.mjs
drwxr-xr-x   7 user  staff     224 Apr 29 21:54 types

-----------------------------
Rollup File Analysis -> csj
-----------------------------
bundle size:    146.608 KB
original size:  140.026 KB
code reduction: 0 %
module count:   16

-----------------------------
Rollup File Analysis -> esm
-----------------------------
bundle size:    146.608 KB
original size:  140.026 KB
code reduction: 0 %
module count:   16


# 제거 후
❯ ls -al packages/ui/dist
total 40
drwxr-xr-x   7 user  staff   224 Apr 29 20:29 .
drwxr-xr-x  14 user  staff   448 Apr 29 21:33 ..
-rw-r--r--   1 user  staff  1022 Apr 29 21:33 index.cjs
-rw-r--r--   1 user  staff  2054 Apr 29 21:33 index.cjs.map
-rw-r--r--   1 user  staff   870 Apr 29 21:33 index.mjs
drwxr-xr-x   7 user  staff   224 Apr 29 20:29 types

-----------------------------
Rollup File Analysis -> csj
-----------------------------
bundle size:    723 Bytes
original size:  1.094 KB
code reduction: 33.91 %
module count:   4

-----------------------------
Rollup File Analysis -> esm
-----------------------------
bundle size:    657 Bytes
original size:  1.094 KB
code reduction: 39.95 %
module count:   4
```

참고로 번들 분석을 위해 [rollup-plugin-analyzer](https://www.npmjs.com/package/rollup-plugin-analyzer)플러그인을 이용하여 확인하였다.
(시각적으로 [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)와 같이 분석해주는 [rollup-plugin-visualizer](https://www.npmjs.com/package/rollup-plugin-visualizer) 도 있음.)

#### support for 'use client' directive

다음과 같이 컴포넌트에 React v18에서 추가된 `'use client';` 라는 directive를 추가한 경우 rollup 번들러 자체에서 제거를 해버리는 이슈가 있었다.

- 관련 이슈
  - https://github.com/rollup/rollup/issues/4699

위의 이슈를 읽다보면, 이 부분은 다음의 코드 부분에서 rollup에서 정의한 directive를 제외하고는 모두 무시해버리는 부분으로 인하여 발생하고 있었다.

- https://github.com/rollup/rollup/blob/master/src/ast/nodes/ExpressionStatement.ts

해당 이슈를 해결하기 위해 많은 사람들이 대안을 제시하거나 플러그인을 구현하여 배포하였다.

일반적으로는 `output.banner` 또는 `output.intro` 옵션을 사용하여서 해당 directive를 번들링에 추가해주는 것이다.
근데 이 방법은 번들링하는 소스 폴더 내부에서 서버 컴포넌트도 지원하는 컴포넌트가 있을 경우에도 해당 directive가 추가됨으로써 SSR 환경에서 활용하기 좋지 않은 방향 같았다.

그러다 해당 이슈의 아래 쪽에 [rollup-preserve-directives](https://github.com/huozhi/rollup-preserve-directives) 플러그인에 대한 추천을 보았고, 2023년 12월을 마지막으로 업데이트가 되고, vite v4 에서 rollup 옵션 부분에서 사용한 것을 보아 이슈가 없을 것 같아 해당 플러그인을 사용해보기로 했다.
[코드](https://github.com/huozhi/rollup-preserve-directives/blob/main/src/index.ts#L91)를 보니 rollup에서 directive 관련하여 처리하는 부분을 제어하여 이슈를 해소한 플러그인 같았다.
(_rollup에서 공식적으로 제거하지 않을 directive를 정의하도록 해주게 가장 베스트 할 텐데...왜 이슈가 등록된 2022년 부터 대처를 안하는 거지...??_)

결국 아래와 같이 설정을 하여 일단 이슈를 해결하였다.

```typescript
//...SKIP...
import preserveDirectives from 'rollup-preserve-directives';

//...SKIP...

  const commonJsBuild = {
//...SKIP...
    plugins: [
      peerDepsExternal({
        packageJsonPath: pkgPath,
      }),
      preserveDirectives(),
      postcss({
        plugins: [autoprefixer()],
      }),
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.lib.json' }),
      terser({
		compress: {
          // remove console.
          drop_console: true,
          // to do not remove directives for 'use client'
          directives: false,
        },
      }),
    ],
  } satisfies RollupOptions;

  const esmBuild = {
    ...commonJsBuild,
    output: {
      ...commonJsBuild.output,
		//...SKIP...
      sourcemap: false,
      preserveModules: true,  // <-- ADDED
      preserveModulesRoot: 'src', // <-- ADDED
    },
  } satisfies RollupOptions;

  return [commonJsBuild, esmBuild];
}
```

##### preserveModules

해당 옵션을 키게 되면 소스 폴더와 동일한 경로에 각 번들링된 파일들이 생성된다.

만약, 각 폴더별로 컴포넌트를 주입하여 사용하도록 지원하고자 한다면, `package.json`의 export 구문에도 명시를 해주어야 사용하는 곳에서 다음과 같은 방법으로도 사용할 수 있다.

```typescript
import { Button } from '@scope/ui-npm-test';
// or
import { Button } from '@scope/ui-npm-test/button';
```

directives 설정을 추가하면서 해당 옵션을 같이 적용한 이유는..
각각의 컴포넌트에 분리한 번들링 파일이 생성되도록 하여, 필요한 컴포넌트에만 `'use client'` 가 설정이 되도록 하고 싶었다.
이 부분을 적용하기 위해서는 해당 옵션을 `true`로 해주어야했다.

예를 들면...

- "preserveModules: false"인 경우
  - 하나에 번들링된 파일 최상단에 directive가 정의된다.

```javasscript
// dist/index.mjs
"use client";
import{jsx as e,jsxs as t}from"react/jsx-runtime";function n({children:t,className:n}){return e("code",.......
```

- "preserveModules: true"인 경우
  - directive를 정의한 button 컴포넌트 번들링 파일을 확인해보면..해당 파일에만 명시가 되어있다.

```
// dist/index.mjs
export{Code}from"./code/index.mjs";export{Card}from"./card/index.mjs";export{Button}from"./button/index.mjs";

// dist/button/index.mjs
"use client";
import{jsx as e}from"react/jsx-runtime";import o from"./index.module.scss.mjs";const r=({children:r,appName:t})=>e("button",{className:o.button,onClick:()=>alert(`Hello from your ${t} app!`),children:r});export{r as Button};
```

그리고 참고로 다른 오픈 소스 라이브러리에서는 SSR 환경에 대해 대응하기 위해 어떠한 형태로 ui 라이브러리를 빌드하는 지 조사해보면 다음과 같은 형태였다.

- [nextui](https://github.com/nextui-org/nextui/blob/canary/packages/components/accordion/tsup.config.ts)
  - 각 컴포넌트 별도 독립된 패키지 형태
  - 빌드 도구: tsup
    - tsup에서 빌드 과정에서 "use client" directive를 번들링 파일 상단에 추가해주고 있음.
  - 각 패키지 컴포넌트는 plop 도구를 이용하여 사전 정의된 템플릿을 이용해서 generate
- [radix-ui theme](https://github.com/radix-ui/themes/tree/main/packages/radix-ui-themes)
  - 클라이언트 대응 컴포넌트에 대해서만 "use client" directive 정의가 되어있으며, 빌드 과정에서 별도로 해당 directive에 대해 핸들링하지 않는 것으로 보여짐.
    - [avatar.tsx - 'use client' 정의된 컴포넌트](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/avatar.tsx)
    - [badge.tsx](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/badge.tsx)
  - 빌드도구: esbuild & tsc
- [material-ui](https://github.com/mui/material-ui/tree/next/packages/mui-material)
  - 클라이언트 대응 컴포넌트에 대해서만 "use client" directive 정의가 되어있으나, 번들링 단계에서 "output.intro" 설정을 통해 "use client" directive를 추가해주고 있음
    - [rollup config 파일 - output.intro 정의 부분](https://github.com/mui/material-ui/blob/next/packages/mui-material/scripts/rollup.config.mjs#L193)
    - [Accordion.js - 'use client' 정의된 컴포넌트](https://github.com/mui/material-ui/blob/next/packages/mui-material/src/Accordion/Accordion.js)
  - 빌드 도구: rollup

## 번들링에 사용된 plugin을 정리하면...

rollup을 위한 빌드를 위해 다음과 같은 플러그인들을 설치하였고, 각 플러그인들의 역할을 정리해보면 다음과 같다.

- [@rollup/plugin-typescript](https://www.npmjs.com/package/@rollup/plugin-typescript)
  - rollup에서 공식적으로 지원한다.
  - typescript를 빌드하기 위한 플러그인
  - tsc를 내부적으로 사용하려 javascript로 변환한다.
  - 번외
    - [rollup-plugin-typescript2](https://www.npmjs.com/package/rollup-plugin-typescript2)
      - **@rollup/plugin-typescript**를 fork하여 제작된 라이브러리
      - 내부적으로 처리하는 방식과 제공하는 기능에서 @rollup/plugin-typescript와 차이가 있다.
      - tsconfig를 override를 지원하여 좀 더 세밀한 커스터마이징이 가능하다.
      - nx에서 제공하는 rollup 플러그인은 typescript2를 이용하고 있음.
    - 두 라이브러리의 차이점은
      - ts 버전의 호환성과 컴파일 옵션의 다양성
      - 성능은 ts가 더 빠르다는 것 같음.
        - https://www.reddit.com/r/typescript/comments/14t9qnx/rollupplugintypescript_vs_rollupplugintypescript2/
      - 간단한 프로젝트나 공식 지원을 선호하면 -> @rollup/plugin-typescript
      - ts 관련하여 세밀한 커스터마이징과 추가적인 기능을 원한다면 -> rollup-plugin-typescript2
- [@rollup/plugin-node-resolve](https://www.npmjs.com/package/@rollup/plugin-node-resolve)
  - `node_modules` 내부의 패키지를 찾아서 필요한 경우 외부 모듈을 번들에 포함시켜주는 역할을 한다.
  - 기본적으로 rollup은 상대 경로를 사용하여 로컬 파일을 가져오지만, 해당 플러그인을 사용하여 `node_modules`를 통하여 가져올 수 있게 해준다.
  - 같이 읽어보면 좋은 링크
    - https://www.js2uix.com/frontend/rollup-study-step3/
- [@rollup/plugin-commonjs](https://www.npmjs.com/package/@rollup/plugin-commonjs)
  - @rollup/plugin-node-resolve와 같이 사용한다.
    - @rollup/plugin-node-resolve랑 같이 사용하는 경우 v13.0.6+ 이상을 사용해야함
      - 최신 버전이 v25.0.7 이므로 이 부분은 크게 이슈가 되지 않을 듯.
  - `node_modules`에서 가져온 CommonJS로 작성된 모듈들을 ES6로 변환하여 처리할 수 있게 해준다.
- [rollup-plugin-peer-deps-external](https://www.npmjs.com/package/rollup-plugin-peer-deps-external)
  - 다른 플러그인들 정의보다 상위에 위치하도록 정의하는 것이 좋음
    - `package.json`의 **peerDependencies**에 정의한 모듈을 번들링 결과물에 포함시키지 않는다.
    - rollup의 "external" 설정과의 차이는?
      - external 필드를 사용하여 번들링 과정에서 제외하고자 하는 것은 동일하나, 별도로 설정 파일에 명시함으로서 제어한다.
      - peerDependencies에 정의한 것과 독립적으로 관리
        - 즉, peerDependencies에 정의하였다고 rollup이 읽어서 처리해주지는 않는다.
- [@rollup/plugin-terser](https://www.npmjs.com/package/@rollup/plugin-terser#rollupplugin-terser)
  - 번들링된 소스를 minify 및 uglify 처리를 도와주는 플러인이다.
- [rollup-plugin-copy](https://www.npmjs.com/package/rollup-plugin-copy)
  - 파일이나 폴더를 복사하기 위해 사용한다.
- [rollup-plugin-postcss](https://www.npmjs.com/package/rollup-plugin-postcss)
- [@rollup/plugin-dynamic-import-vars](https://www.npmjs.com/package/@rollup/plugin-dynamic-import-vars)

## Trouble Shooting

### Module level directives cause errors when bundled, "use client" in "src/button/index.tsx" was ignored.

```bash
src/index.ts → dist...
(!) src/button/index.tsx (1:0): Module level directives cause errors when bundled, "use client" in "src/button/index.tsx" was ignored.
~/demo-playground/packages/ui/src/button/index.tsx:1:0
1: 'use client';
   ^
2: import { jsx as _jsx } from "react/jsx-runtime";
3: export const Button = ({ children, className, appName }) => {
created dist in 580ms
```

- 원인
  - React v18에서 추가된 [`'use client';`](https://react.dev/reference/rsc/use-client) 라는 directive에 대해 번들링에서 아직 100% 지원이 되지 않아서 발생하는 부분으로 추정된다.
- 해결 방법
  - ref) https://github.com/TanStack/query/issues/5175#issuecomment-2025073071
  - 완벽한 해결방법이라기보다는 일시적인 우회방안이라고 이해하면 될 듯.
  - rollup의 [onwarn](https://rollupjs.org/configuration-options/#onwarn) 필드를 정의하여 해당 warning을 무시하도록 아래와 같이 추가해주었다.

```typescript
onwarn: (warning, warn) => {
  if (
    warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
    /\"use client\"/.test(warning.message)
  ) {
    return;
  }

  warn(warning);
},
```

### Module not found: Can't resolve '../../node_modules/.pnpm/style-inject@0.3.0/node_modules/style-inject/dist/style-inject.es.mjs'

```bash
Import trace for requested module:
../../node_modules/.pnpm/@scope+react-ui@1.0.0_@types+react-dom@18.3.0_@types+react@18.3.1_react-dom@18.3.1_react@18.3.1/node_modules/@scope+react-ui/buttons/ActionButton.mjs
../../node_modules/.pnpm/@scope+react-ui@1.0.0_@types+react-dom@18.3.0_@types+react@18.3.1_react-dom@18.3.1_react@18.3.1/node_modules/@scope/react-ui/index.mjs
./components/home/demo/Switch.tsx
 ⨯ ../../node_modules/.pnpm/@scope+react-ui@1.0.0_@types+react-dom@18.3.0_@types+react@18.3.1_react-dom@18.3.1_react@18.3.1/node_modules/@scope/react-ui/buttons/ActionButton.module.scss.mjs:6:1
Module not found: Can't resolve '../../node_modules/.pnpm/style-inject@0.3.0/node_modules/style-inject/dist/style-inject.es.mjs'

https://nextjs.org/docs/messages/module-not-found
```

- 현상
  - 빌드한 패키지 모듈을 npm으로 부터 다운받아 사용할 때에 node_module의 번들링된 파일을 찾지 못해 런타임 에러가 발생하였다.
- 원인
  - rollup에서 **preserveModules** 옵션을 `true`로 설정하여 빌드 시에 외부 모듈에 대해 `node_modules` 하위에 번들링된 파일을 생성하게 된다.
  - 근데, 이 부분이 npm publish에서 기본적으로 ignore가 되어 배포가 진행되다보니, 패키지를 다운받을 때에 해당 모듈이 없어 발생하게 되었다.
- 해결
  - https://github.com/rollup/rollup/issues/3684#issuecomment-1535836196 의 글을 참고하여 node_modules의 폴더명을 바꿔서 빌드가 되도록 수정하였다.

```typescript
output: {
  ...commonJsBuild.output,
  format: 'esm',
  minifyInternalExports: false,
  sourcemap: false,
  preserveModules: true,
  preserveModulesRoot: 'src',
  entryFileNames: (chunkInfo) => {
    if (chunkInfo.name.includes('node_modules')) {
      return chunkInfo.name.replace('node_modules', 'external') + '.js';
    }

    return '[name].mjs';
  },
},
```

## 참고 자료

- https://rollupjs.org
  - [rollup github repo](https://github.com/rollup/rollup/blob/master/rollup.config.ts)
- [nx github repo](https://github.com/nrwl/nx/blob/master/packages/rollup/src/executors/rollup/rollup.impl.ts)
- [CommonJS vs. ESM](https://www.hoeser.dev/blog/2023-02-21-cjs-vs-esm/)
- [CommonJS에서 ESM으로 전환하기](https://tech.kakao.com/2023/10/19/commonjs-esm-migration/)
- [How to build a component library with React and TypeScript](https://blog.logrocket.com/how-to-build-component-library-react-typescript/)
- [Component library setup with React, TypeScript and Rollup](https://dev.to/siddharthvenkatesh/component-library-setup-with-react-typescript-and-rollup-onj)
