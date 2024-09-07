## Chat With WebSocket

### Http vs WebSocket

- http
  - **stateless**
  - backend와 사용자 사이에 아무런 연결이 없으므로 backend는 사용자를 기억하지 못한다.
    - 요청에 대해 처리하고 잊어버린다. 단지, server는 요청에 대해 응답하고 끝!!
  - real-time으로 응답과 요청이 발생하지 않는다.
- websocket
  - **bi-directional connection**
  - 브라우저로부터 connection이 발생하면 handshake를 하는 것과 같이 동작한다.
  - connection이 되어있으므로 서버는 사용자가 누구인지 기억하고, 원할 때 언제든 사용자에게 메시지를 보낼 수 있다.
  - real-time으로 연결이 끊길 때까지 연결되어있다.

### Usage

#### server

```typescript
import http from 'http';

// ...SKIP

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Listening on 'http://localhost:${PORT}'`);
});

/**
 * create a WebSocket server
 */
const ws = new WebSocket.Server({ server });

ws.on('connection', (socket) => {
  console.log('🤗 Client connected');

  socket.on('close', () => {
    console.log('😢 Disconnected from Browser');
  });

  socket.on('message', (message) => {
    ws.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message.toString('utf-8'));
      }
    });
  });
});
```

#### client

```typescript
const socket = new WebSocket(`ws://${window.location.host}`);
console.log('This is a TypeScript client script', socket);

socket.addEventListener('open', () => {
  console.log('🤗 Connect to server');
  socket.send('👋 Hello!');
});

socket.addEventListener('message', (message) => {
  console.log('📨 Message received from server:', message.data);
});

socket.addEventListener('close', () => {
  console.log('😢 Disconnected from server');
});
```

### WebSocket 단점

별도의 라이브러리를 사용하지 않는 경우에 대한 단점.

- nickname, message 등에 대한 주고받는 메시지 타입 구분이 어렵다.
  - 구분을 하려면 조건문 처리를 하며 타입을 구분해줘야한다.
  - 타입 스크립트랑 같이 사용할 때 타입 처리가 유연하지 않다.
