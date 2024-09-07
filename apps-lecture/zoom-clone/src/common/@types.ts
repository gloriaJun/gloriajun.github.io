export type MessageTypes = 'message' | 'nickname' | 'join' | 'leave';
export interface WebSocketMessageData {
  type: MessageTypes;
  nickname?: string;
  payload: string;
}

export interface SocketIoMessageData {
  payload: string;
}
