---
title: (Unit Test) Trouble Shooting with Jest
tags:
  - jest
  - unit-test
  - react
createdAt: 2024-03-20 16:59
updatedAt: 2024-03-21 13:11
---

#### thrown: "Exceeded timeout of 5000 ms for a test.

`user.click`과 같은 이벤트 발생 시에 timeout 에러가 발생하는 경우

```bash

    thrown: "Exceeded timeout of 5000 ms for a test.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."

```

- 원인: `jest.useFakeTimers()`를 정의하여 사용하는 경우 발생
- 해결: 아래와 같이 `deply: null`을 전달해서 해결

```javascript
function setup(jsx: React.ReactElement) {
  return {
    // if you want to use the fake timers, set 'delay' to null
    // - https://testing-library.com/docs/user-event/options/#delay
    user: userEvent.setup({ delay: null }),
    ...render(jsx),
  };
}


it('should be display the tooltip content when click the button', async () => {
  const { user } = setup(<Tooltip onOpenChange={onOpenChangeMock} />);

  const triggerButtonElement = screen.getByTestId('tooltip-trigger-btn');

  expect(triggerButtonElement).toBeInTheDocument();
  await user.click(triggerButtonElement);

  expect(onOpenChangeMock).toHaveBeenNthCalledWith(1, true);
});
```

#### This ensures that you're testing the behavior the user would see in the browser.

```bash
  console.error
    Warning: An update to Tooltip inside a test was not wrapped in act(...).

    When testing, code that causes React state updates should be wrapped into act(...):

    act(() => {
      /* fire events that update state */
    });
    /* assert on the output */

    This ensures that you're testing the behavior the user would see in the browser.
```

- 원인
  - 컴포넌트 코드 내에서 `setTimeout`을 사용하여, 특정 시간이 지나면 상태 값이 변경되도록 구현을 하였는데, 이 부분으로 인한 오류였다.
  - 참고: [React Testing Library and the “not wrapped in act” Errors](https://davidwcai.medium.com/react-testing-library-and-the-not-wrapped-in-act-errors-491a5629193b)
- 해결
  - `act`로 감싸주어 jest.advanceTimersByTime 함수를 실행하도록 하였다.

```typescript
it('should be close the tooltip after timeout', () => {
  const timeout = 3;
  setup(
    <Tooltip
      defaultOpen={true}
      timeout={timeout}
      onOpenChange={onOpenChangeMock}
    />
  );

  act(() => {
    jest.advanceTimersByTime(timeout * 1000);
  });

  expect(onOpenChangeMock).toHaveBeenNthCalledWith(1, false);
});
```
