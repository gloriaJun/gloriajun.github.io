import http from 'node:http';

import socketIo from 'socket.io';

import { SocketIoMessageData } from '~/common/@types';
import { SocketMessages } from '~/common/constants';

export function createSocket(server: http.Server) {
  const io = new socketIo.Server(server);

  io.on('connection', (socket) => {
    console.log('🤗 Client connected', socket);

    socket.on(
      SocketMessages.join,
      (message: SocketIoMessageData, callback: () => void) => {
        console.log(socket.rooms, message);
        socket.join(message.payload);
        console.log(socket.rooms);

        console.log('join-room', message);
        callback();
      },
    );

    socket.on('message', (message) => {
      io.emit('message', message);
    });

    socket.on('disconnect', () => {
      console.log('😢 Client Disconnected!!');
    });
  });

  return io;
}
