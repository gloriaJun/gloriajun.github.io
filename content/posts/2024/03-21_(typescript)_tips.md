---
title: (TypeScript) tips
tags:
  - typescript
createdAt: 2024-03-21 09:58
updatedAt: 2024-03-21 09:59
---

### 객체의 특정 key에 해당하는 value 타입 가져오기

```typescript
type MyType = { name: string; age: number; isAdmin: boolean };

type ValueOfType<T, K extends keyof T> = T[K];

type NameValueType = ValueOfType<MyType, 'name'>; // string
```
