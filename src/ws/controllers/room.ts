import { storage, userSocketSet, userSocketMap } from '../../services/storageService';
import { getRoomIndexFromMessage, createRoomUpdateResponse, removeRoomByIndex } from '../../services/roomService';
import { getFirstPlayerInRoomName } from '../../services/playerService';
import { createAndAddGame, createGameResponse, setPlayersToGame } from '../../services/gameService';
import { WebSocket } from 'ws';

function broadcast(message: any) {
    const jsonMessage = JSON.stringify(message);
    userSocketSet.forEach((s: WebSocket) => s.send(jsonMessage));
}


export function handleCreateRoom(userName: string) {

    const roomExists = storage.rooms.some(room => room.roomUsers[0].name === userName);

    if (roomExists) {
        console.log(`Warning: Room already created by ${userName}. Skipping.`);
        return;
    }


    storage.rooms.push({

        roomId: storage.rooms.length,
        roomUsers: [{ name: userName, index: 0 }],
    });

    const updateRoomResponse = createRoomUpdateResponse(storage.rooms);
    broadcast(updateRoomResponse);
    console.log(`Response: update_room (created by ${userName})`);
}

export function handleAddUserToRoom(socket: WebSocket, message, userName: string) {
    const roomIndex = getRoomIndexFromMessage(message);
    const firstPlayerInRoom = getFirstPlayerInRoomName(storage.rooms, roomIndex);


    if (!firstPlayerInRoom || firstPlayerInRoom === userName) {
        return;
    }

    removeRoomByIndex(storage.rooms, roomIndex);
    broadcast(createRoomUpdateResponse(storage.rooms));
    console.log(`Response: update_room (users joined)`);

    const idGame = createAndAddGame(storage.games);

    const firstPlayerSocket = userSocketMap.get(firstPlayerInRoom);
    const secondPlayerSocket = userSocketMap.get(userName);

    if (firstPlayerSocket) {
        const firstPlayerResponse = createGameResponse(idGame, 0);
        firstPlayerSocket.send(JSON.stringify(firstPlayerResponse));
        console.log(`Response: create_game to Player 1 (${firstPlayerInRoom}).`);
    }

    if (secondPlayerSocket) {
        const secondPlayerResponse = createGameResponse(idGame, 1);
        secondPlayerSocket.send(JSON.stringify(secondPlayerResponse));
        console.log(`Response: create_game to Player 2 (${userName}).`);
    }

    setPlayersToGame(firstPlayerInRoom, userName, idGame, storage.games);
}
