---
title: (TypeScript) statisfies operator
tags:
  - typescript
createdAt: 2024-03-21 09:01
updatedAt: 2024-03-21 09:01
---

> TypeScript developers are often faced with a dilemma: we want to ensure that some expression matches some type, but also want to keep the most specific type of that expression for inference purposes.

[statisfies operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) 는 TypeScirpt v4.9에서 추가된 operator 이다.

해당 operator는 statisfies (statisfy의 복수형)라는 단어의 사전적 정의가 의미하는 뜻에서 살~짝 유추해 볼 수 있듯이, **변수의 타입을 추론한 결과가 type 또는 interface를 만족하는 지 체크**를 하기 위해 사용할 수 있다.

예를 들면, *palette*라는 객체를 정의하는 과정에서 다음 예시와 같이 `blue`라고 작성해야할 변수명에 `bleu`와 같이 잘못 입력하였다고 하였을 때에...
코드 리뷰 과정이나 테스트 과정에서 해당 오타를 발견하지 못한다면...알 수가 없고..이 것은 의도하고자 하는 부분이 아니었을 것이다.

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

그렇다보니, 위와 같은 경우를 예방하기 위해 대부분 명시적으로 객체에 타입을 다음 예시와 같이 정의를 해주었다.

```typescript
type Colors = 'red' | 'green' | 'blue';
type RGB = [red: number, green: number, blue: number];

const palette: Record<Colors, RGB> = {
  red: [255, 0, 0],
  green: '#00ff00',
  bleu: [0, 0, 255],
  // ~~~~ The typo is now caught!
};
```

하지만, 위와 같이 사용하는 경우에는 객체가 의도한 것과 잘못 정의되는 경우에 대해서는 예방을 할 수 있었지만...
객체에 대한 타입이 `
`const palette: Record<Colors, RGB>`와 같이 명시적으로 고정이 됨으로 인하여 각 key에 대한 값이 "string | RGB"와 같이 유니온 타입으로 정의되는 경우, 각 타입의 내장 함수를 주입된 값에 대한 타입 체크 없이 사용이 어려웠다.

예를 들자면..다음과 같다.

```typescript
// 👇 TS2345: Argument of type number is not assignable to parameter of type never
const redComponent = palette.red.includes(255);
// 👇 TS2339: Property toUpperCase does not exist on type string | RGB//      Property toUpperCase does not exist on type RGB
const greenNormalized = palette.green.toUpperCase();
```

위와 같은 타입 에러를 회피하기 위해...

ts-ingore를 양심의 가책을 느끼며(?) 우회하거나..

```typscript
// @ts-ignore
const redComponent = palette.red.includes(255);
```

번거롭더라도..타입 체크를 하여 사용을 한다던가 하였을 것이다.

```typescript
const redComponent =
  typeof palette.red === 'string' ? true : palette.red.includes(255);
```

이러한 불편함을 `statisfies` 를 사용하면 해소할 수 있다.

statisfies operator를 이용해서는 다음과 같이 객체와 함수에 정의하여 사용할 수 있다.

- 객체에 정의하는 경우

```typescript
type Colors = 'red' | 'green' | 'blue';
type RGB = [red: number, green: number, blue: number];
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
  bleu: [0, 0, 255],
  /*  
TS1360: Type  
{   red: [number, number, number];   green: string;   bleu: number[]; }  
does not satisfy the expected type Record<Colors, string | RGB>  
Object literal may only specify known properties, but bleu does not exist in type Record<Colors, string | RGB>. Did you mean to write blue?  
   */
} satisfies Record<Colors, string | RGB>;
```

잘못 정의된 부분에 대해 타입 에러도 발생하고 다음과 같이 추론된 객체를 확인할 수 있다.

```bash
const palette: {
red: [number, number, number];
green: string;
bleu: number[];
}
```

- 함수에 정의하는 경우

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
