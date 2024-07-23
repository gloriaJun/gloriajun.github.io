---
title: (TypeScript) Conditional Type
tags:
  - typescript
createdAt: 2024-02-14 19:28
updatedAt: 2024-02-22 21:19
---

`X extends Y` 와 같은 형태에서  `X` 타입의 변수가 `Y` 타입에 할당될 수 있는지에 따라 참값이 평가되는 형태이다.

예를 들면...다음과 같다.

- 체크하는 조건 타입의 변수가 할당될 수 있으므로 참으로 평가되는 경우
  - `true extends boolean`
  - `'test' extends string`: `'test'` 는 `string` 에 할당될 수 있음
  - `Array<{ foo: string }> extends Array<unknown>`
- 체크하는 조건 타입의 변수가 할당될 수 없으므로 거짓으로 평가되는 경우
  - `string extends number`: 문자열은 숫자 타입에 할당될 수 없음
  - `boolean extends true`: `boolean` 타입 가운데 `false` 는 `true` 에 할당될 수 없음

### 제네릭 타입 인자 꺼내오기

```typescript
type PromiseType<T> = T extends Promise<infer U> ? U : never;

// type A = number
type A = PromiseType<Promise<number>>;

// type B = string | boolean
type B = PromiseType<Promise<string | boolean>>;

// type C = never
type C = PromiseType<number>;
```

### Tuple 다루기

#### 특정 인덱스 이후의 타입들만 가져오고 싶은 경우

`[string, number, boolean]` 과 같은 TypeScript의 [Tuple Type](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)에서 `[number, boolean]` 과 같은 부분만 가져오고 싶은 경우...
Conditional Type과 [Variadic Tuple Type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)을 활용함으로써 이를 간단히 구현할 수 있다.

```typescript
type TailOf<T> = T extends [unknown, ...infer U] ? U : [];

// type A = [boolean, number];
type A = TailOf<[string, boolean, number]>;
```

#### 비어있는 tuple인지 체크

```typescript
type IsEmpty<T extends any[]> = T extends [] ? true : false;

// type B = true
type B = IsEmpty<[]>;

// type C = false
type C = IsEmpty<[number, string]>;
```

### Example

#### 접두사를 제외하여 추론하기

```typescript
type InOrOut<T> = T extends `fade${infer R}` ? R : never;

// type I = "In"
type I = InOrOut<'fadeIn'>;
// type O = "Out"
type O = InOrOut<'fadeOut'>;
```

#### 공백을 제외한 타입 체크하기

```typescript
type T = TrimRight<'Test      '>;
type TrimRight<T extends string> = T extends `${infer R} ` ? TrimRight<R> : T;
```

#### 특정 구분자로 split 한 타입 정의하기

```typescript
type Split<S extends string> = S extends `${infer T}.${infer U}`
  ? [T, ...Split<U>]
  : [S];

// type S = ["foo", "bar", "baz"];
type S = Split<'foo.bar.baz'>;
```

## references

- https://toss.tech/article/template-literal-types
