---
title: (Unit Test) Jest with React @testing-library
tags:
  - unit-test
  - react
  - jest
createdAt: 2024-03-21 13:08
updatedAt: 2024-03-21 13:08
---

### with timeout

```typescript
beforeEach(() => {
  jest.useFakeTimers();
});
```

### with userEvent

```typescript
function setup(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };

it('should be display the tooltip content when click the button', async () => {
  const { user } = setup(<Tooltip onOpenChange={onOpenChangeMock} />);
  const triggerButtonElement = screen.getByTestId('tooltip-trigger-btn');
  await user.click(triggerButtonElement);
  expect(onOpenChangeMock).toHaveBeenNthCalledWith(1, true);
});
```

- fireEvent vs userEvent
  - `userEvent` 내부적으로는 `fireEvent`를 이용하여 구현되어있다.
    - 사용자의 상호작용을 시뮬레이션하는 함수들을 제공한다.
    - 사용자가 웹 페이지와 상호작용하는 방식을 모방하여, 테스트 중인 컴포넌트에 이벤트를 발생시키는 것을 도와준다.
  - 즉, fireEvent 대비 실제 사용자가 사용하는 것과 유사하게 이벤트를 발생시킨다고 한다.
  - 참고
    - [[react-testing-library] fireEvent vs userEvent](https://velog.io/@pds0309/react-testing-library-fireEvent-vs-userEvent)
    - [testing library의 userEvent와 fireEvent는 무슨 차이점이 있을까?](https://dev.classmethod.jp/articles/difference-between-user-event-and-fire-event/)
