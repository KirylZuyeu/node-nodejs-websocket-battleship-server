import { WebSocket } from 'ws';
import { storage, userSocketMap, userSocketSet } from '../../services/storageService';
import { setPlayerShips, createAndAddGame, createGameResponse, createStartGameResponse, createTurnResponse } from '../../services/gameService';
import { removeUserCreatedRoom, createRoomUpdateResponse } from '../../services/roomService';
import {getRandomShips} from '../../utils/shipsGenerator';
function sendGameStartData(game: any) {
    const [firstPlayerName, secondPlayerName] = [game.firstPlayerName, game.secondPlayerName];

    const responseP1 = createStartGameResponse(storage.games, game.gameId, 0);
    userSocketMap.get(firstPlayerName)?.send(JSON.stringify(responseP1));

    const responseP2 = createStartGameResponse(storage.games, game.gameId, 1);
    userSocketMap.get(secondPlayerName)?.send(JSON.stringify(responseP2));

    const turn = createTurnResponse(game);
    userSocketMap.get(firstPlayerName)?.send(JSON.stringify(turn));
    userSocketMap.get(secondPlayerName)?.send(JSON.stringify(turn));

    console.log(`2-Player Game started (Game ID: ${game.gameId})`);
}

function broadcastRoomUpdate() {
    const updateRoomResponse = createRoomUpdateResponse(storage.rooms);
    const jsonResponse = JSON.stringify(updateRoomResponse);
    userSocketSet.forEach((s: WebSocket) => s.send(jsonResponse));
}

export function handleAddShips(socket: WebSocket, message) {

    const { gameId, indexPlayer, ships } = JSON.parse(JSON.parse(message.toString()).data);

    const game = storage.games.find((g) => g.gameId === gameId);
    if (!game) return;

    const areBothPlayersAddShips = setPlayerShips(indexPlayer, ships, game);
    console.log('areBothPlayersAddShips', areBothPlayersAddShips);

    if (areBothPlayersAddShips) {
        if (game.secondPlayerName === 'BOT') {

            const response = createStartGameResponse(storage.games, gameId, 0);
            socket.send(JSON.stringify(response));
            const turn = createTurnResponse(game);
            socket.send(JSON.stringify(turn));
            console.log(`Game with BOT started (Game ID: ${gameId})`);
        } else {

            sendGameStartData(game);
        }
    }
}


export function handleSinglePlay(socket: WebSocket, userName: string) {

    removeUserCreatedRoom(storage.rooms, userName);
    broadcastRoomUpdate();

    const idGame = createAndAddGame(storage.games);

    const game = storage.games.find((g) => g.gameId === idGame);
    if (!game) return;

    game.firstPlayerName = userName;
    const playerResponse = createGameResponse(idGame, 0);
    socket.send(JSON.stringify(playerResponse));

    game.secondPlayerName = 'BOT';
    const botShips = getRandomShips();
    setPlayerShips(1, botShips, game);

    console.log(`Single play game created (Game ID: ${idGame})`);
}
