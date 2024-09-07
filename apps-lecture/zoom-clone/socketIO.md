## SocketIO

[socketIO](https://socket.io)는 socket 통신을 손쉽게 구현할 수 있게 해주는 framework 또는 library 이다.

- real-time, bidirectional 그리고 event-based communication을 제공한다.
- websocket이 사용 가능한 환경에서는 websocket을 사용하여 구현한 부분이 있다.
  - 만약, 사용자의 브라우저가 기기가 websocket을 지원하지 않더라도 다른 방법을 이용해서 소켓 통신을 지원한다.
- 반드시, BE와 FE 간에 통신을 위해 socket.io를 사용할 필요는 없지만, socket.io는 실시간 기능과 같은 부분들을 더 쉽게 만들 수 있는 기능들을 제공한다.
- websocket 보다 많은 기능을 포함하고 있다보니, 조금 더 무겁다.

### Usage

- custom Event를 정의하여 사용할 수 있다.
- server가 종료되면 client는 재연결을 일정 간격으로 시도한다.
- client가 원하는 형태로 어떤 메시지로든 server로 전달할 수 있다.
  - string, json, function (해당 함수를 서버가 특정 시점에 클라이언트로 전달하고, 클라이언트에서 실행된다.)
    - 원하는 만큼 argument를 정의하여 사용할 수 있다.
  - function은 메시지에 대한 처리가 끝난 뒤에 실행하는 형태로 반드시 제일 마지막 argument로 전달되어야한다.
    - (예를 들어) server에서 client의 메시지를 전달받은 뒤에 시간이 오래 걸리는 등과 같은 작업을 하고, 해당 작업이 완료되었음을 client에 전달하고 싶은 경우에 사용할 수 있다.
    - 클라이언트에서 전달된 함수를 서버에서 실행 할 때 보안의 이슈가 생길 가능성도 있음.
    - 서버에서 해당 함수에 argument를 담아 함수를 호출할 수도 있다.
-

#### server

- ref doc: https://socket.io/docs/v4/server-installation/

```typescript
const io = new socketIo.Server(server);

io.on('connection', (socket) => {
  console.log('🤗 Client connected', socket);

  socket.on('join-room', (message, callback: () => void) => {
    //   io.emit('message', message);
    console.log('join-room', message);
    // 👇 This function will run on client not server-side
    callback();
  });

  socket.on('message', (message) => {
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('😢 Client Disconnected!!');
  });
});
```

#### client

- ref doc: https://socket.io/docs/v4/client-installation/

```typescript
// ['event-name', 'message-data'(json object), 'function']
// - function will call anytime on server-side and it execute on frontend side
socket.emit('join-room', { payload: inputEl.value }, () => {
  console.log('server is done!');
});
```

#### Standalone build

server에서 socket.io를 설치해서 소켓을 생성하고, client가 접속을 하면 `<domain>/socket.io/socket.io.js` 스크립트 리소스가 생성되고, 클라이언트에서 아래와 같이 주입을 하면 `io` 라는 api를 사용할 수 있다.

- `io` API는 접속해야하는 서버의 정보를 알아서 찾아 연결해준다.
  - websocket 연결을 위해 선언한 부분과 같이 서버 정보를 넣어 socket을 생성해주는 부분이 필요없다.

```html
<script src="/socket.io/socket.io.js">
```

#### From NPM

또는 다음과 같이 npm 모듈을 설치하여서도 사용할 수 있다.

```bash
npm install socket.io-client
```
