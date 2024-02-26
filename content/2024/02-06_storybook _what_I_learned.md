
#draft
#wil #storybook #test 

---
aliases: (Storybook) 스토리 계층 구조 설정하기
created: 2024-02-06 17:16 
last-updated: 2024-02-06 17:16 

---

# Storybook - What I learned...


스토리북을 운영해보면서 느꼈던 부분 그리고 장단점을 정리해보려고 한다.

## About Story file

### story location

작성한 story 파일의 경로는 스토리에서 작성하는 컴포넌트와 같은 경로에 위치하는 것이 유지보수 및 컴포넌트에 대한 코드 분석 등의 관점에서 관심사가 분리되지 않는 것 같다.

예를 들면, 다음과 같이 작성한 컴포넌트에 대해 스토리 외의 테스트 파일들도 같은 경로에 위치하는 형태이다.

```bash
# components/button/
index.tsx
index.stories.tsx
index.test.tx
```

### story hierarchy structure

Storybook v7.x 이후에는 title을 별도로 정의하지 않아도 해당 스토리가 위치한 경로를 참고하여 auto generate 해주는 기능이 제공된다.
해당 기능을 사용하여 스토리의 계층이 정의되도록 하는 것이 다음과 다음과 같은 장점이 있는 것 같다.
- 컴포넌트가 위치한 경로 또는 작성된 스토리북의 계층 구조를 보고, 해당 컴포넌트를 찾기가 용이하다.
- 컴포넌트명이 변경되거나 위치가 조정된 경우, 스토리북에서의 위치도 같이 반영이 된다.

### Presentation and Container Pattern

작은 atomic 단위부터 컴포넌트 조각들로 구성된 화면 단위의 컴포넌트 까지 스토리북을 활용하여 작성하는 것이 도움이 될 수 있었다.

작은 컴포넌트의 단위의 경우, 대부분 비지니스 로직을 담고 있지 않지만, 화면 단위의 경우에는 Pure Presentation 패턴으로만 작성하기에는 비효율적일 수도 있는 것 같다.

하지만 Pure Presentation 패턴으로 작성하고, 해당 컴포넌트를 주입받아 별도의 비지니스 로직을 처리하는 Container 컴포넌트를 구성하는 형태에 대해서도 분명한 장점은 있었다.
- Story 작성이 간결하고, Props에 정의된 데이터를 그대로 control을 이용하여 데이터 조작할 수 있다.
- [Storyshot](https://www.npmjs.com/package/@storybook/addon-storyshots)과 같은 addon을 이용하여 테스트를 실행할 수 있다.

그리고 생각하는 단점은 다음과 같은 것 같다.
- 특정 컴포넌트 주입 시, 반복되어 사용되는 비지니스 로직을 하나의 컴포넌트에 정의할 수 없어, hook과 같은 기능을 이용하여 분리해주어야한다.


이 부분은 각 프로젝트의 성격에 맞춰 유리한 방향으로 구조를 잡고 가야하는 부분일 것 같아, 무엇이 정답이라고 말하기는 어려운 부분인 것도 같다.

스토리북 공식 문서에서 가이드하는 부분에 대해서는 [해당 링크](https://storybook.js.org/docs/writing-stories/build-pages-with-storybook#pure-presentational-pages)를 참고하여 잘 판단하여 결정하면 될 것 같다.


## About Story plugins

사용해본 스토리북 플러그인 중에 유용했다고 생각했던 플러그인들을 정리해보자면..

- [storybook-addon-useragent](https://storybook.js.org/addons/storybook-addon-useragent
	- use agent 별로 스토리북을 이용한 테스트가 가능
- [@geometricpanda/storybook-addon-badges](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&ved=2ahUKEwiNhqLc7ciEAxVYj68BHayeAXUQFnoECBkQAQ&url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40geometricpanda%2Fstorybook-addon-badges&usg=AOvVaw0fgVV1x3WW3JGWMe0OvVYP&opi=89978449)
	- 현재 배포된 버전을 표기하거나, 해당 컴포넌트에 대한 특정 정보를 배지를 이용하여 표현할 수 있음
- [@storybook/addon-console](https://www.npmjs.com/package/@storybook/addon-console
	- 개발자도구의 콘솔 로그에 노출되는 정보를 스토리북의 action 탭에도 출력됨으로 별도로 개발자 도구를 키지 않고도 콘솔 로그에 찍히는 정보를 확인할 수 있다.
- [@storybook/addon-storyshots](https://www.npmjs.com/package/@storybook/addon-storyshots)
	- 각 스토리 케이스에 대하여 html 스냅샷을 생성하여 이전 버전과 비교하여 변경 이력을 추적할 수 있다.
		- 공통 모듈을 사용하는 부분에서 받게 되는 영향도 예측이라던가...마치 보험과 같은 존재였다라고 할까나??
	- 대신, 해당 플러그인을 활용하여 스냅샷 테스트를 한다면 msw, redux와 같은 비지니스 로직과 같은 해당 컴포넌트에 포함되어있다면, 의도된 대로 화면이 그려지지 않아서 의미없는 테스트가 실행될 수도 있다.
		- 그러므로, 스냅샷 테스트를 활용하고자 한다면 가급적 props로 주입받아 그려지는 presentation 컴포넌트로 구현을 하거나, 공통 모듈들에 적용하여 활용하는 방안을 검토해보는 것이 좋을 것 같다.
- [@storybook/addon-docs](https://storybook.js.org/addons/@storybook/addon-docs)
	- 스토리북을 활용한 개발 가이드 문서까지!!! 
	- 근데, 아직 제대로 잘 활용해볼 기회가 없어서....아쉬운 기능...
- [@storybook/addon-interactions](https://storybook.js.org/addons/@storybook/addon-interactions)
	- 사용자 클릭 시에 대한 동작 테스트 자동화를 할 수 있다!
	- 자세한 내용은 다음의 링크들 참고!
		- https://storybook.js.org/docs/writing-tests/interaction-testing
		- https://storybook.js.org/docs/writing-stories/play-function


그 외에 다른 많은 플러그인도 있지만, 지금까지 내가 활용해본 플러그인을 기준으로 정리해보았다.
