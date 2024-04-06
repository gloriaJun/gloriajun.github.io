---
title: (TypeScript) statisfies operator
tags:
  - typescript
createdAt: 2024-03-21 09:01
updatedAt: 2024-03-21 09:01
---

[statisfies operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) 는 정의한 객체나 함수에 대한 타입에 대해 추론된 결과가 만족하는 지 체크하기 위한 목적으로 사용할 수 있다.

예를 들면, 다음과 같이 **palette**라는 객체를 정의하는 과정에서 오타가 존재한다고 하였을 때에...

```typescript
// Each property can be a string or an RGB tuple.

const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
  bleu: [0, 0, 255],
  // ^^^^ sacrebleu - we've made a typo!
};

// We want to be able to use array methods on 'red'...
const redComponent = palette.red.at(0);

// or string methods on 'green'...
const greenNormalized = palette.green.toUpperCase();
```

기존에는 위와 같은 경우 잘못 정의되는 key 값을 예방하기 위해 다음과 같이 정의하여 사용하였는데...

```typescript
type Colors = 'red' | 'green' | 'blue';
type RGB = [
  red: number | number[] | string,
  green: number | number[] | string,
  blue: number | number[] | string,
];

const palette: Record<Colors, RGB> = {
  red: [255, 0, 0],
  green: '#00ff00',
  bleu: [0, 0, 255],
  // ~~~~ The typo is now caught!
};
```

하지만, 위와 같이 사용하는 경우에는 내가 정의한 타입으로 고정되어 각 key에 대한 정의된 타입이 다음 예시와 같이 표현이 되어 명확히 알기 어렵다는 불편함이 있었다.

```bash
const palette: Record<Colors, RGB>
```

하지만, `statisfies` 를 사용하여 다음과 같이 정의를 하면...

```typescript
type Colors = "red" | "green" | "blue";
type RGB = [red: number | number[], green: number | number[], blue: number | number[]]

const palette  = {
red: [255, 0, 0],
green: "#00ff00",
bleu: [0, 0, 255]
// ~~~~ The typo is now caught!
} statisfies Record<Colors,RGB>;
```

잘못 정의된 부분에 대해 타입 에러도 발생하고 다음과 같이 추론된 객체를 확인할 수 있다.

```bash
const palette: {
red: [number, number, number];
green: string;
bleu: number[];
}
```

그리고 함수에 사용하고자 하는 경우에는 다음과 같은 형태로 사용하면 된다.

```typescript
interface PostContentData {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const getPostData = ((id) => {
  return {
    id,
    title: 'test',
    tags: ['a', 'b'],
    createdAt: '2024-02-03',
    updatedAt: '2024-02-03',
  };
}) satisfies (id: string) => PostContentData;
```

좀 더 자세한 예시와 설명은 다음을 참고하면 된다.

- [How to Use the TypeScript satisfies Operator](https://www.freecodecamp.org/news/typescript-satisfies-operator/)
