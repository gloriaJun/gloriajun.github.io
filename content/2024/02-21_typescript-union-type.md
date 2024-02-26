
#typescript 

---

aliases: 
created: 2024-02-21 19:21 
last-updated: 2024-02-22 21:22 

---

# (typescript) union type

### 2개 이상의 union type을 활용하여 정의하기


```typescript
type VerticalAlignment = "top" | "middle" | "bottom";
type HorizontalAlignment = "left" | "center" | "right";

// type Alignment =
//   | "top-left"    | "top-center"    | "top-right"
//   | "middle-left" | "middle-center" | "middle-right"
//   | "bottom-left" | "bottom-center" | "bottom-right"
type Alignment = `${VerticalAlignment}-${HorizontalAlignment}`;
```

### 규칙성있게 반복되는 형태의 네이밍을 타입을 이용하여 정의하기

- 변경 전
```typescript
type EventNames = 'click' | 'doubleClick' | 'mouseDown' | 'mouseUp';

type MyElement = {
    addEventListener(eventName: EventNames, handler: (e: Event) => void): void;

    // onEvent() 도 하나씩 추가해줘야 한다
    onClick(e: Event): void;
    onDoubleClick(e: Event): void;
    onMouseDown(e: Event): void;
    onMouseUp(e: Event): void;
};
```

- 변경 후
```typescript
type EventNames = 'click' | 'doubleClick' | 'mouseDown' | 'mouseUp';

// CapitalizedEventNames = 'Click' | 'DoubleClick' | ...;
type CapitalizedEventNames = Capitalize<EventNames>;

// type HandlerNames = 'onClick' | 'onDoubleClick' | 'onMouseDown' | 'onMouseUp';
type HandlerNames = `on${CapitalizedEventNames}`;

type Handlers = {
  [H in HandlerNames]: (event: Event) => void;
};

// 원래 MyElement 그대로 작동!
type MyElement = Handlers & {
  addEventListener: (eventName: EventNames, handler: (event: Event) => void) => void;
};
```


## references

- https://toss.tech/article/template-literal-types