> NX monorepo 환경에서 React 라이브러리 빌드하기

NX 구조에서 React 라이브러리 개발을 위해 패키지를 추가하려고 하니...다음과 같은 옵션이 주어졌다...

```bash
nx g lib mylib --directory=libs --publishable --importPath=@mylibs
? Which generator would you like to use? …
@nx/js:library
@nx/next:library
@nx/node:library
@nx/react:library

//...SKIP...
```

## `@nx/next:library` vs `@nx/react:library`

라이브러리를 개발해서 Next.js와 React 모두에 상관없이 사용을 하고자 하는 것이 목적이기는 한데...
설마..Next와 React 각각 따로 따로 빌드 환경을 만들어야하는 건가? 하는 의구심이 들기도 하고...각각의 차이가 무엇인지 알고 싶어졌다.

먼가 NX Document를 확인해보았다.

- [@nx/next:library](https://nx.dev/nx-api/next/generators/library#nxnextlibrary)
  - Create a React Library for an Nx workspace
- [@nx/react:library](https://nx.dev/nx-api/react/generators/library#nxreactlibrary)
  - Create a React Library for an Nx workspace

응? 머라고 둘 다 리액트 라이브러리라면....세부적인 차이가 먼데?? 싶었다... (너무...너~어무 해!!)

그래서..gpt에게 물어봤다....그리고 내가 알고 싶은 답을 얻었다... (Thanks for GPT)
_구글링하여 글도 읽으며 찾아볼 수도 있었지만....딱히 눈에 확 띄게 검색되는 결과도 없긴했다....._

GPT에게 얻은 지식으로 간략히 정리하면...다음과 같았다.

- @nx/next:library
  - Next.js의 이미지 최적화, 국제화, 환경 변수 설정 등과 같은 고유한 기능을 활용할 수 있도록 설계가 가능하다.
- @nx/react:library
  - React의 기본적인 구조를 따른다.

라이브러리가 특정 프레임워크의 기능과 긴밀하게 통합될 것인지 아니면 범용적으로 사용될 것인지에 따라 사용하면 된다

그리고 추가로...

- [@nx/rollup:rollup](https://nx.dev/recipes/tips-n-tricks/compile-multiple-formats#compile-typescript-libraries-to-multiple-formats)
  - 유틸리티 성 라이브러리를 작성 후, rollup 도구를 이용하여 번들링 할 때에 해당 package를 사용하면 되는 것으로 보여짐.

## TL;DR

- React와 Next.js 프로젝트에서 모두 사용이 가능한 형태의 라이브러리를 구현하여 빌드하고자 한다면 `@nx/react:library`
  - 해당 라이브러리는 기본적인 리팩트의 패턴과 구조를 따르므로 Next.js 환경에서도 문제 없이 사용할 수 있다.
