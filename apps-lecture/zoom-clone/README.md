# Zoom Clone Coding

#TypeScript #NodeJS #SocketIO #WebRTC

- https://nomadcoders.co/noom

기존 강의의 경우에는 javascript만을 이용하여 구현하였으나, TypeScript를 사용하여 강의를 따라가며 실습을 하였다.

## Related Tech Spec

### What learned

- WebSocket
- SocketIO
- WebRTC

### What implement

- Realtime
- Chat
- Rooms
- Notifications
- Video Call
- Audio Call

#### Added Tech Spec

- TypeScript

## History

### Tools

#### Nodemon

- [documentation](https://github.com/remy/nodemon#nodemon)
- 디렉토리의 파일 변경이 감지되면 노드 응용프로그램을 자동으로 다시 시작하여 node.js 기반의 응용 프로그램 개발에 도움을 주는 도구이다.

#### Webpack

typescript로 작성을 하다보니, 클라이언트에서 해석할 수 있도록 하기 위해 javascript로 컴파일을 한 뒤에 동작하도록 처리가 필요했다.

- 참고한 글
  - [Typescript React + Express SSR](https://gist.github.com/anthonyjoeseph/bdcf9be5cfc515cad334b687237c1556)
  - [React 18 Typescript(+NodeJS)에서 SSR 사용하기](https://dreamfuture.tistory.com/68)

### Template Engine

요즘은 주로 React, Vue와 같은 라이브러리를 이용하여 구현을 하다보니, 템플릿 엔진을 검토하여 적용하거나 사용하지는 않았는데...
강의를 듣다 오랫만에 듣게되어 간략히 정리를...

- [pug(=Jade)](https://pugjs.org/api/getting-started.html)
  - 강의에서 사용된 템플릿 엔지
  - 들여쓰기를 통해 계층 구조를 나타냄.
  - 사용법이 간단하다.
- [ejs](https://ejs.co)
  - html 양식을 그대로 사용한다.
- [handlebar](https://handlebarsjs.com/installation/)
  - 예전에 프로젝트에서 도입하여 사용했던 템플릿 엔진
  - 오래 전이라 기억이 가물하지만, 러닝 커브가 그렇게 높지 않은 느낌이었다. 근데, 이후로 다른 템플릿 엔진을 handlebar 만큼 사용해보지는 못해서 딱히 장단점에 대해 느낀 부분은 크지 않아 머리 평을 하기 애매한 것도 같다.

그 외 템플릿 엔진에 대해 비교한 글들 참고할만한 것들

- [템플릿 엔진 - EJS, Jade, Handlebars](https://skout90.github.io/2017/08/15/Node.js/4.%20템플릿엔진/)
- [Switching from Handlebars to Pug](https://medium.com/nerd-for-tech/switching-from-handlebars-to-pug-416693e1cb76)

### Lecture

- [Chat With WebSocket](websocket.md)
- [SocketIO](socketIO.md)
