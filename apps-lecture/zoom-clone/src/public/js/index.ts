import { io } from 'socket.io-client';

import { SocketMessages } from '~/common/constants';

const socket = io();

const welcomeEl = document.getElementById('welcome');
const roomFormEl = welcomeEl?.querySelector('form');

roomFormEl?.addEventListener('submit', (event) => {
  event.preventDefault();

  const inputEl = roomFormEl.querySelector('input');

  if (inputEl) {
    console.log('room', inputEl?.value);
    socket.emit(SocketMessages.join, { payload: inputEl.value }, () => {
      console.log('server is done!');
    });
    inputEl.value = '';
  }
});
