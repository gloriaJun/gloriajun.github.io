---
title: (Storybook) Document generation
tags:
  - '#storybook'
  - '#document'
createdAt: 2024-04-11 18:25
updatedAt: 2024-04-11 18:25
---

스토리북을 기반으로 작성한 컴포넌트에 대하여 다음과 같은 생각을 해본적이 있을 것이다.

- 나도 구현한 컴포넌트에 대해 멋~드러지게 매뉴얼과 같은 문서를 만들어보고 싶은데...
  - 근데 그렇다고 스토리도 만들고, 따로 문서를 작성하기는 번거롭지 않나??
- props들에 대한 역할을 코드 보고 이해하거나, 주석으로 보완해놓았는데 스토리북을 통해서도 같이 알 수 있다면 해당 먼가 더 있어보일 것 같은데..

이러한 고민을 Storybook에서 제공하는 [Storybook Document 기능](https://storybook.js.org/docs/writing-docs)을 이용한다면 100% 만족스럽지 않을 수는 있더라도 손쉽게! 간단한 설정만 추가하는 것으로!! 문서를 생성할 수 있다.

👇 바로!! 요런 스타~일의 문서를 말이다!!!
![storybook-doc](https://storybook.js.org/88b699769fb5d0ddda73ae62acd582dc/docs-completed.png)

그리고 Storybook v7 이상을 사용한다면 이전 버전보다 더 간단하게 설정할 수 있다.
(날로 발전하는 스토리북....v7 부터는 zero-configuration을 적용하고 있어서 설정이 매우 간편해졌다.)

- Storybook v7에서의 변경 점은 [Storybook 7 Docs - New architecture, streamlined UX, and readymade doc blocks](https://storybook.js.org/blog/storybook-7-docs/) 참고

문서를 생성하도록 설정하기 위한 과정과 document에 작성하고자 하는 내용들을 어떠한 형태로 story 파일에 추가해주면 되는 지에 대해 기록하고자 한다.

### Configure to generate a document

`.storybook/main.ts` 파일에 문서 생성을 위한 옵션을 설정해준다.

```typescript
// .storybook/main.ts

import type { StorybookConfig } from '@storybook/react';

const config: StorybookConfig = {
  // ...SKIP...
  docs: {
    // 👇 Add this line
    autodocs: true,
  },
};

export default config;
```

위와 같이 설정 후에, 스토리북을 실행해보면 각 컴포넌트의 스토리 상위에 `Doc` 라는 매뉴가 생성되고 해당 링크를 열어보면, 자동으로 생성된 문서 포맷을 확인할 수 있으며, 기본적으로 스토리북의 Document의 구조는 아래와 같이 정의되어있다.

```typescript
docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories />
        </>
      ),
    },
```

기본으로 정의되는 `Doc` 이라는 이름을 변경하고 싶거나 문서 포맷을 수정하고 싶다면 [Automatic documentation and Storybook](https://storybook.js.org/docs/writing-docs/autodocs#write-a-custom-template) 를 참고하면 된다.

#### Display TOC

생성된 문서에 대한 TOC를 추가하고자 하면 아래와 같이 간단히 설정할 수 있다.

```typescript
// .storybook/preview.ts

// ...SKIP...

const preview: Preview = {
  parameters: {
    // ...SKIP...
    // 👇 Add this lines
    docs: {
      toc: true,
    },
  },
};

export default preview;
```

toc에 대한 좀 더 세부적인 설정은 [Automatic documentation and Storybook > Configure the table of contents](https://storybook.js.org/docs/writing-docs/autodocs#configure-the-table-of-contents) 참고한다.

### Write more component information on each story

이제, 컴포넌트에 대한 속성의 추가적인 정보를 스토리북의 문서 작성에 첨부된 아래 이미지와 같이 작성하려고 한다면 기존 작성된 스토리 또는 컴포넌트 props에 추가적인 설명들을 보완해주어야한다.
![doc-example](https://storybook.js.org/3794791255ae7a4970184da18faabd76/autodocs.png)

#### Write Property Information

[Storybook Doc > Args](https://storybook.js.org/docs/api/arg-types) 문서를 참고해서 각 속성 정보에 대한 설명을 추가해준다.

```typescript

/**
 * 여기에 작성된 내용은 Document의 Title 하단의 `<Description />` 영역에 노출됩니다.
 * markdown을 이용하여 작성 가능합니다.
*/

const meta: Meta<Props> = {
  component: Tooltip,
  parameters: {
    // Title 하단의 `<SubTitle />` 영역에 노출됩니다.
    componentSubtitle: 'Tooltip Component',
  },
  argTypes: {
    defaultOpen: {
      control: 'boolean',
      description:
        'The open state of the tooltip when it is initially rendered.',
      table: {
        category: 'Tooltip Component Props',
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    side: {
  control: 'radio',
  options: ['top', 'bottom', 'left', 'right'],
  description:
    'The preferred side of the anchor to render against when open. Will be reversed when collisions occur and avoid collisions is enabled.',
  table: {
    category: ' TooltipContent Component Props',
    type: {
      summary: 'enum',
    },
    defaultValue: { summary: 'bottom' },
  },
},

// ...SKIP...

export const Normal: Story = {
  args: {},
  parameters: {
    description: {
      // 각 스토리에 대한 부연 설명으로, 각 스토리에 대한 제목 하단에 노출됩니다.
      story: 'Display only text without any button or arrow',
    },
  },
};
```

### Trouble Shootings

#### 컴포넌트 파일에 작성된 properties를 자동으로 읽어와서 생성해준다는 데 동작이 되지 않는다.

[Storybook Doc > Controls](https://storybook.js.org/docs/7.6/essentials/controls)를 읽어보아도 properties 정보를 읽어서 추론하여 각 스토리의 controls 영역과 document의 속성 정보 테이블에 노출을 해준다고 하는데...아무리 테스트해보아도 자동으로 읽어오지 않았다.

구글링을 열심히 해본 결과 `react-docgen` 라이브러리에서 **React.forwardRef**로 감싼 형태로 컴포넌트가 정의된 경우에는 속성 정보를 제대로 읽어오지 못하고 있다는 것 같은 내용들이 확인되었다.

- [https://github.com/reactjs/react-docgen/issues/878](https://github.com/reactjs/react-docgen/issues/878)
  - TS에서 forwardRef 지원해주세요!!!! 라는 내용의 요청 (여기 원하는 사람 하나 추가요!!! 🙏🙏🙏🙏)
- [https://github.com/storybookjs/storybook/issues/23084](https://github.com/storybookjs/storybook/issues/23084)
  - react-docgen의 자동생성이 다양한 사용케이스를 커버하지 못하는 듯한 느낌을 받은 깃 이슈.....내용들...
  - [https://oss.issuehunt.io/r/storybookjs/storybook/issues/15334](https://oss.issuehunt.io/r/storybookjs/storybook/issues/15334) ← 이거도 유사한 내용

그래서 얼마든지 다양한 유즈 케이스가 있는 부분에 대해서는 편리한 자동 생성 기능을 기대하면....
버전 업데이트 시에 예측하지 못하는 side-effect도 가지고 가게 되기도 하므로...이슈 해결을 기대하기보다는....번거로워도 story 파일의 `argTypes` 속성을 정성~들여서 작성해주었다.
(타입으로 props가 수정되면 에러가 나서 같이 관리가 되겠지...추가되는 속성에 대해서는 업데이트를 놓칠 수 있겠지만....)
