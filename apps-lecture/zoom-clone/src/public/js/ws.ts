// websocket client example
import { WebSocketMessageData, MessageTypes } from '~/common/@types';

const messageList = document.querySelector('ul');
const messageForm = document.getElementById('message');
const nicknameForm = document.getElementById('nickname');

const socket = new WebSocket(`ws://${window.location.host}`);

const appendMessage = (data: string, isSender: boolean) => {
  const {
    type,
    nickname,
    payload: message,
  } = JSON.parse(data) as WebSocketMessageData;
  const li = document.createElement('li');

  if (type === 'join' || type === 'leave') {
    const span = document.createElement('li');

    span.style.color = '#808080';
    span.style.fontStyle = 'italic';

    span.innerText = [nickname, message].filter(Boolean).join(': ');

    li.append(span);
  } else {
    li.innerText = [nickname, isSender ? '📝' : '📨', ': ', message]
      .filter(Boolean)
      .join('');
  }
  messageList!.append(li);
};

const handleSubmitEvent = (event: SubmitEvent) => {
  event.preventDefault();

  const element = event.target as HTMLElement;

  const input = element.querySelector('input');
  const { value } = input ?? {};

  if (value) {
    const type = element.id as MessageTypes;
    const data = {
      type,
      payload: value,
    } satisfies WebSocketMessageData;
    const message = JSON.stringify(data);

    socket.send(message);

    if (type !== 'nickname') {
      appendMessage(message, true);
    }
  }

  input!.value = '';
};

socket.addEventListener('open', () => {
  console.log('🤗 Connect to server');
});

socket.addEventListener('message', (message: MessageEvent<string>) => {
  appendMessage(message.data, false);
});

socket.addEventListener('close', () => {
  console.log('😢 Disconnected from server');
});

nicknameForm?.addEventListener('submit', handleSubmitEvent);

messageForm?.addEventListener('submit', handleSubmitEvent);
