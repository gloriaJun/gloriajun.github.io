
#typescript

---

aliases: (typescript) Type definition for function
created: 2024-02-14 19:28 
last-updated: 2024-02-22 21:19 

---

# (typescript) Type definition for function

## Obtain type definition from the pre-defined function argument

[`Parameters<Type>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype) can help it.

```javascript
declare function testA(a: number, b: string[], c?: boolean, d?: Record<string, string>): void;

type ParamsArgs = Parameters<typeof testA>; 
// [<a: number, b: string[], c?: boolean | undefined, d?: Record%3Cstring, string> | undefined]
```


### Get type from the specific index

Using [Conditional Type](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) and  [Variadic Tuple Type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types) with Parameters

```typescript
declare function testA(a: number, b: string[], c?: boolean, d?: Record<string, string>): void;

type TailOf<T> = T extends [unknown, ...infer U] ? U : [];

type ParamsArgs = Parameters<typeof testA>; 
// [<a: number, b: string[], c?: boolean | undefined, d?: Record%3Cstring, string> | undefined]

type ParamsFromSecondArgs = TailOf<ParamsArgs>; 
// [b: string[], c?: boolean | undefined, d?: Record%3Cstring, string> | undefined]
```
