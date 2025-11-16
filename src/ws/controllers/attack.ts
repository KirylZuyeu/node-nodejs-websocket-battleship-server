import { WebSocket } from 'ws';
import { createTurnResponse, getWinnerNameIfFinished, createFinishGameResponse } from '../../services/gameService';
import { createWinnersResponse, updateWinnerStats } from '../../services/playerService';
import { processAttack, selectRandomTarget, createAttackResponse, addAdditionalAttackResultsToStorage, createSurroundingMissesResponses } from '../../services/attackService';
import { storage, userSocketMap, userSocketSet } from '../../services/storageService';


function sendToPlayers(game: any, message: any, targetSocket?: WebSocket) {
    const jsonMessage = JSON.stringify(message);
    if (targetSocket) {

        targetSocket.send(jsonMessage);
    } else {

        userSocketMap.get(game.firstPlayerName)?.send(jsonMessage);
        userSocketMap.get(game.secondPlayerName)?.send(jsonMessage);
    }
}

function checkAndHandleGameFinish(game: any, targetSocket?: WebSocket): boolean {
    const winnerName = getWinnerNameIfFinished(game);
    if (!winnerName) return false;

    const finishGameResponse = createFinishGameResponse(game);
    console.log('winner:', winnerName);
    sendToPlayers(game, finishGameResponse, targetSocket);

    updateWinnerStats(storage.winners, winnerName);
    const updateWinnersResponse = createWinnersResponse(storage.winners);
    userSocketSet.forEach((s: WebSocket) => s.send(JSON.stringify(updateWinnersResponse)));

    return true;
}

function handleBotTurn(game: any, socket: WebSocket) {
    const [x, y] = selectRandomTarget(game, 1);
    const result = processAttack(x, y, 1, game);
    console.log('botAttack:', result);

    if (result) {
        const attackRes = createAttackResponse(x, y, 1, result);
        socket.send(JSON.stringify(attackRes));
    }

    if (result === 'killed') {
        addAdditionalAttackResultsToStorage(1, game);
        const responses = createSurroundingMissesResponses(1, game);
        responses.forEach((response) => socket.send(JSON.stringify(response)));

        if (checkAndHandleGameFinish(game, socket)) return;
    }

    if (result === 'killed' || result === 'shot') {
        handleBotTurn(game, socket);
        return;
    }

    game.currentPlayerIndex = 0;
    const turn = createTurnResponse(game);
    socket.send(JSON.stringify(turn));
}


export function processPvpAttack(x: number, y: number, indexPlayer: number, game: any) {
    const result = processAttack(x, y, indexPlayer, game);
    console.log('result:', result || 'Choose another place for attack');

    if (result) {
        const attackRes = createAttackResponse(x, y, indexPlayer, result);
        sendToPlayers(game, attackRes);
    }

    if (result === 'killed') {
        addAdditionalAttackResultsToStorage(indexPlayer, game);
        const responses = createSurroundingMissesResponses(indexPlayer, game);
        responses.forEach((response) => sendToPlayers(game, response));

        if (checkAndHandleGameFinish(game)) return;
    }

    if (result === 'miss') {

        game.currentPlayerIndex = game.currentPlayerIndex === 0 ? 1 : 0;
    }

    const turn = createTurnResponse(game);
    sendToPlayers(game, turn);
}


export function processPveAttack(x: number, y: number, indexPlayer: number, game: any, socket: WebSocket) {
    const result = processAttack(x, y, indexPlayer, game);
    console.log('result:', result || 'Choose the another place for attack');

    if (result) {
        const attackRes = createAttackResponse(x, y, indexPlayer, result);
        socket.send(JSON.stringify(attackRes));
    }

    if (result === 'killed') {
        addAdditionalAttackResultsToStorage(indexPlayer, game);
        const responses = createSurroundingMissesResponses(indexPlayer, game);
        responses.forEach((response) => socket.send(JSON.stringify(response)));

        if (checkAndHandleGameFinish(game, socket)) return;
    }

    if (result === 'miss') {

        handleBotTurn(game, socket);
        return;
    }


    const turn = createTurnResponse(game);
    socket.send(JSON.stringify(turn));
}



export function handleAttack(socket: WebSocket, message) {
    const { x, y, gameId, indexPlayer } = JSON.parse(JSON.parse(message.toString()).data);
    const game = storage.games.find((g) => g.gameId === gameId);
    if (!game || game.currentPlayerIndex !== indexPlayer) {
        console.log("Game not Found");
        return;
    }

    if (game.secondPlayerName !== 'BOT') {
        processPvpAttack(x, y, indexPlayer, game);
    } else {
        processPveAttack(x, y, indexPlayer, game, socket);
    }
}

export function handleRandomAttack(socket: WebSocket, message) {
    const { gameId, indexPlayer } = JSON.parse(JSON.parse(message.toString()).data);
    const game = storage.games.find((g) => g.gameId === gameId);
    if (!game || game.currentPlayerIndex !== indexPlayer) {
        console.log("It's not this player turn for random attack.");
        return;
    }

    const [x, y] = selectRandomTarget(game, indexPlayer);

    if (game.secondPlayerName !== 'BOT') {
        processPvpAttack(x, y, indexPlayer, game);
    } else {
        processPveAttack(x, y, indexPlayer, game, socket);
    }
}
