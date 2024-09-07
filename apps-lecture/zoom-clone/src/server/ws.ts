import { Server } from 'http';

import WebSocket from 'ws';

import { WebSocketMessageData } from '~/common/@types';

export function createWebSocket(server: Server) {
  /**
   * create a WebSocket server
   */
  const ws = new WebSocket.Server({ server });

  ws.on('connection', (socket) => {
    const sendMessageToClient = (message: WebSocketMessageData) => {
      ws.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              ...message,
              // @ts-ignore
              nickname: socket.nickname,
            }),
          );
        }
      });
    };

    console.log('🤗 Client connected');
    sendMessageToClient({
      type: 'join',
      payload: '👋 Hello! from new connected client',
    });

    socket.on('message', (message) => {
      const { type, payload } = JSON.parse(
        message.toString('utf-8'),
      ) as WebSocketMessageData;

      switch (type) {
        case 'nickname':
          // @ts-ignore
          socket[type] = payload;
          break;
        default:
          sendMessageToClient({
            type: 'message',
            payload,
          });
      }
    });

    socket.on('close', () => {
      console.log('😢 Client Disconnected!!');
      sendMessageToClient({
        type: 'leave',
        payload: '😢 Bye! one client is disconnected!!',
      });
    });
  });
}
