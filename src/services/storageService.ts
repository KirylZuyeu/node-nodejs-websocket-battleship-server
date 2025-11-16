import dataBase from "../constants/storage";
import { WebSocketServer, WebSocket } from 'ws';

export const storage = {
  rooms: [],
  games: [],
  winners: [],
  userDatabase: dataBase,
};

export const userSocketMap = new Map();
export const userSocketSet = new Set<WebSocket>();
