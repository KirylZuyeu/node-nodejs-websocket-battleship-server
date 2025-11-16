import { WebSocketServer } from 'ws';
import { WS_PORT } from '../constants/constants';
import { userSocketMap, userSocketSet } from '../services/storageService';
import { handleAttack, handleRandomAttack } from './controllers/attack';
import { handleRegistration, handleCloseConnection } from './controllers/auth';
import { handleCreateRoom, handleAddUserToRoom } from './controllers/room';
import { handleAddShips, handleSinglePlay } from './controllers/game';

const webSocketServer = new WebSocketServer({ port: WS_PORT }, () => {
    console.log(`WebSocket server started on port ${WS_PORT}.`);
});

webSocketServer.on('connection', (socket) => {
  userSocketSet.add(socket);
  console.log('New connection opened');

  let userName = '';
  socket.on('message', (message) => {
    const messageType = JSON.parse(message.toString()).type;
    console.log('request:', messageType);

    if (messageType === 'reg') {
      userName = JSON.parse(JSON.parse(message.toString()).data).name;
      userSocketMap.set(userName, socket);
    }

    switch (messageType) {
      case 'reg': {
          handleRegistration(socket, message);
          break;
      }
      case 'create_room': {
          handleCreateRoom(userName);
          break;
      }
      case 'add_user_to_room': {
          handleAddUserToRoom(socket, message, userName);
          break;
      }
      case 'add_ships': {
                handleAddShips(socket, message);
                break;
            }
      case 'attack': {
            handleAttack(socket, message);
            break;
        }

        case 'randomAttack': {
            handleRandomAttack(socket, message);
            break;
        }
      case 'single_play': {
                handleSinglePlay(socket, userName);
                break;
            }
    }
  });
socket.on('close', () => {
        handleCloseConnection(socket, userName);
    });
});
