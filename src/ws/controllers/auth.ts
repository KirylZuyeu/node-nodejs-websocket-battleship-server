import { registerUser, createWinnersResponse } from '../../services/playerService';
import { createRoomUpdateResponse, removeUserCreatedRoom } from '../../services/roomService';
import { storage, userSocketSet, userSocketMap } from '../../services/storageService';
import dataBase from '../../constants/storage';
import { WebSocket } from 'ws';


function broadcast(message: any) {
    const jsonMessage = JSON.stringify(message);
    userSocketSet.forEach((s: WebSocket) => s.send(jsonMessage));
}

export function handleRegistration(socket: WebSocket, message) {
    const responseMessage = registerUser(message);
    socket.send(JSON.stringify(responseMessage));

    const updateRoomResponse = createRoomUpdateResponse(storage.rooms);
    broadcast(updateRoomResponse);

    const updateWinnersResponse = createWinnersResponse(storage.winners);
    broadcast(updateWinnersResponse);
}

export function handleCloseConnection(socket: WebSocket, userName: string) {
    userSocketSet.delete(socket);

   let disconnectedUserName = userName;

    userSocketMap.forEach((value, key) => {
        if (value === socket) {
            disconnectedUserName = key;
            userSocketMap.delete(key);
        }
    });

    if (disconnectedUserName) {
        const userIndex = dataBase.findIndex((user) => user.name === disconnectedUserName);
        if (userIndex !== -1) {
            dataBase.splice(userIndex, 1);
        }
    }
    removeUserCreatedRoom(storage.rooms, disconnectedUserName);
    const updateRoomResponse = createRoomUpdateResponse(storage.rooms);
    broadcast(updateRoomResponse);

    console.log('Connection closed for user:', disconnectedUserName || 'unknown');
}
