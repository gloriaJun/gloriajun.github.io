---
title: (Part 1) Planning Pocker App with Next.js
subtitle: 프로젝트를 생성하고, 간단한 소켓 통신 구현하기
tags:
  - '#planning-pocker'
  - '#nextjs'
  - '#express'
  - '#socket-io'
  - '#side-project'
createdAt: 2024-04-04 17:13
updatedAt: 2024-04-10 23:14
---

> next.js와 socket.io를 이용하여 planning pocker 만들기

스토리 포인트를 산정할 때마다 오픈소스로 구현된 서비스를 사용하다보니 직접 구현을 하고, 필요한 기능들을 추가로 구현해보면 어떨까 생각이 들었고, 조사를 해보다보니 재미있어 보여서 시작해보게 되었다.

## Tech Spec

- Next.js v14.1.x
- React v18.2.x
- Socker.io v4.7.x
- Express v4.19.x

## Requirement

일단 생각하여 정리해본 내가 구현해보고 싶은 기능들을 정리해보았다.

##### Step1

- 세션을 생성한다
- 사용자가 룸을 만들고 다른 사용자를 초대할 수 있다.
- 사용자들이 해당 룸에 참가할 수 있다.
- 선택가능한 스토리포인트를 카드로 보여준다.

##### Step2

- Storypoint를 선택할 수 있다
- 선택된 Storypoint를 기준으로 계산된 평균 값을 보여준다.

##### Step3

- 내가 선택할 포인트를 가이드에 따라 산정할 수 있다. (스토리포인트 선택 기준)

##### Step4

- 현재 스토리포인트를 부여할 아이템을 입력할 수 있다.
  - 각 아이템에 따라 참가자들이 선택한 포인트와 평균 값 및 최종 선택한 포인트의 이력을 확인할 수 있다.

##### Step5

- 룸에 참여한 사람들과 채팅을 할 수 있다.

## History

### Project 생성

```bash
❯ npx create-next-app

Need to install the following packages:
create-next-app@14.1.4
Ok to proceed? (y) y
✔ What is your project named? … storypoint-planning-pocker
✔ Would you like to use TypeScript? … No / Yes
✔ Would you like to use ESLint? … No / Yes
✔ Would you like to use Tailwind CSS? … No / Yes
✔ Would you like to use `src/` directory? … No / Yes
✔ Would you like to use App Router? (recommended) … No / Yes
✔ Would you like to customize the default import alias (@/*)? … No / Yes
✔ What import alias would you like configured? … @/*
Creating a new Next.js app in /Users/gloria/Documents/storypoint-planning-pocker.

Using npm.

Initializing project with template: app


Installing dependencies:
- react
- react-dom
- next

Installing devDependencies:
- typescript
- @types/node
- @types/react
- @types/react-dom
- eslint
- eslint-config-next


added 316 packages, and audited 317 packages in 23s

125 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
Success! Created planning-pocker at /Users/gloria/Documents/storypoint-planning-pocker
```

### 간단한 서버와 클라이언트 구현

일단, 실시간 채팅 로직을 응용하기 위해서 간단하게 채팅 프로그램을 먼저 프로토타입으로 만들어보기로 했다.

Next.js v14 App Router를 이용하여 구현을 하려고 하다보니 14 버전에서는 App Route를 이용한 방식에서는 소켓 통신에 대해 아직 지원이 잘 되지 않는다고 하였다.

- https://github.com/vercel/next.js/discussions/59454
- https://www.reddit.com/r/nextjs/comments/18ydcfn/help_me_integrate_socketio_with_nextjs14_app/

또한 Sokcet.io 공식 문서에서 Next.js와의 연동에 대해 [Node를 이용하여 별도로 서버를 구성하여 사용하는 방향](https://socket.io/how-to/use-with-nextjs)을 가이드 하고 있어, express를 이용하여 서버를 구성하기로 하였다.

#### Server

Next.js에 작성된 예시 코드를 참고하여 custom server를 사용하도록 스크립트를 작성하였다.

- [Next.js - Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)

```typescript
// ./server/index.ts

import { createServer } from 'node:http';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

그리고 TypeScript로 작성을 하고 있고, customer server로 구현되는 스크립트에 대해 commonjs 패턴이 동작하도록 하기 위해 `ts-node`를 설치하고 `tsconfig.server.json` 파일을 추가해주었다.

```bash
pnpm add -D ts-node
```

```json
// tsconfig.server.json

{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "noEmit": false,
    "outDir": "dist"
  },
  "include": ["./src/server"]
}
```

위와 같이 수정을 한 후에 `package.json`의 스크립트를 다음과 같이 수정하여준다.

```json
// package.json

  "scripts": {
    "dev": "ts-node --project tsconfig.server.json ./server/index.ts",
    "build": "next build",
    "start": "NODE_ENV=production $npm_execpath run dev",
    "lint": "next lint"
  },
```

그 뒤에 `pnpm run dev`를 실행시켜서 정상적으로 서버가 기동되고, 웹 브라우저를 통해 페이지가 접속이 되는 지 확인하였다

```bash
pnpm run dev

> storypoint-planning-pocker@0.1.0 dev /Users/gloria/Documents/mio/storypoint-planning-pocker
> ts-node --project tsconfig.server.json ./src/server/index.ts

> Ready on http://localhost:3000
(node:93326) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ○ Compiling / ...
 ✓ Compiled / in 1620ms (523 modules)
 ✓ Compiled /favicon.ico in 171ms (521 modules)
```

##### 간단한 Socket 통신을 위한 로직 구현

Socket 통신에 필요한 라이브러리와 Express 서버를 사용하도록 수정하기 위해서 [express](https://expressjs.com) 라이브러리를 설치하였다.
socket.io - 웹 클라이언트와 서버 간의 실시간 양방향 통신이 가능하도록 해주는 JavaScript 라이브러리이다.

```bash
pnpm add socket.io socket.io-client express
pnpm add -D @types/express
```

[Socket.io - How to use with Next.js](https://socket.io/how-to/use-with-nextjs) 코드를 참고하여 socket 통신을 위한 로직을 추가하고, express 서버를 사용하도록 하기 위해 다음과 같이 코드를 수정하였다.

```typescript
// ./server/index.ts

import express from 'express';
import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('>> Client connected');

    socket.on('message', (data) => {
      console.log('>> Received message: ', data);
      //   io.emit('message', data);
    });

    socket.on('disconnect', () => {
      console.log('>> Client disconnected');
    });
  });

  server.all('*', (req, res) => {
    return handler(req, res);
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

#### Client

socket 연결을 위한 스크립트를 작성해준다.

```typescript
// ./src/api/socket.ts

'use client';

import { io } from 'socket.io-client';

export const socket = io();
```

`./src/app/pages.tsx` 컴포넌트를 다음과 같이 수정하였다.

```typescript
// ./src/app/page.tsx
'use client';

import { socket } from '@/api/socket';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on('upgrade', (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport('N/A');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <div>
      <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
      <p>Transport: {transport}</p>
      <button
        type="button"
        onClick={() => {
          socket.emit('message', 'Hello! World!!!');
        }}
      >
        Send Message
      </button>
    </div>
  );
}
```

`pnpm run dev`를 실행한 뒤에 웹브라우저에서 아래와 같이 노출이 되면 정상적으로 동작이 되는 것이다.

```bash
Status: connected
Transport: websocket
[Send Message] // <-- button 요소가 보여져야한다.
```

button을 클릭하면 서버를 기동한 터미널에 아래와 같은 메시지가 출력이 된다.

```bash
> Ready on http://localhost:3000
(node:36949) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ○ Compiling / ...
 ✓ Compiled / in 2.1s (572 modules)
>> Client connected
 ✓ Compiled in 181ms (549 modules)
>> Received message:  Hello! World!! <<--- 웹 브라우저의 "Send Message" 버튼 클릭 후에 이 메시지가 노출이 되어야한다.
```

## What I Learned and My Thoughts...

- Next.js v14 의 App Route 기능을 이용한 소켓 통신에 대해서는 아직까지는 공식 문서 외에는 자료가 잘 없어서 간단한 소켓 연결만 구현하는 데도 생각보다 어려웠다.

## Reference

- [Implement Web Sockets with NextJS and API routes](https://medium.com/@farmaan30327/implement-web-sockets-with-nextjs-and-api-routes-6a14916e6c1a)
- [How to use with Next.js](https://socket.io/how-to/use-with-nextjs)
