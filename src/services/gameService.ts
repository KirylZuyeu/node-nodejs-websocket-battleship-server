import { BOARD_SIZE, TOTAL_SHIPS_TO_KILL } from "../constants/constants";

function createEmptyBoard(): number[][] {
    return Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => 0)
    );
}


function buildShipsMatrix(ships: any): any[][] {
    const matrix: any[][] = Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => [])
    );

    ships.forEach((ship: any) => {
        const { position: { x, y }, direction, length } = ship;
        const shipCells: Array<[number, number]> = [];


        for (let i = 0; i < length; i++) {
            const cellX = direction ? x : x + i;
            const cellY = direction ? y + i : y;
            shipCells.push([cellY, cellX]);
        }


        shipCells.forEach(([cellY, cellX]) => {
            matrix[cellY][cellX] = shipCells;
        });
    });
    return matrix;
}



export function setPlayerShips(
    indexPlayer: number,
    ships: any,
    game: any
): boolean {

    const playerPrefix = indexPlayer === 0 ? 'firstPlayer' : 'secondPlayer';


    game[`${playerPrefix}Ships`] = ships;
    game[`${playerPrefix}ShipsMatrix`] = buildShipsMatrix(ships);
    game[`${playerPrefix}Shots`] = createEmptyBoard();


    return game.firstPlayerShips.length > 0 && game.secondPlayerShips.length > 0;
}

export function createAndAddGame(storage: any): number {

    const newGameId = storage.length;

    storage.push({
        gameId: newGameId,
        firstPlayerName: '',
        secondPlayerName: '',
        firstPlayerShips: [],
        secondPlayerShips: [],
        firstPlayerShipsMatrix: [],
        secondPlayerShipsMatrix: [],
        currentPlayerIndex: 0,
        firstPlayerShots: createEmptyBoard(),
        secondPlayerShots: createEmptyBoard(),
        temporaryAttackResults: [],
        firstPlayerKilledShipsCounter: 0,
        secondPlayerKilledShipsCounter: 0,
    });

    return newGameId;
}

export function createGameResponse(idGame: number, idPlayer: number) {
    console.log('response:', 'create_game');
    const data = {
        idGame,
        idPlayer,
    };
    return { type: 'create_game', data: JSON.stringify(data), id: 0 };
}


export function setPlayersToGame(
    firstPlayerName: string,
    secondPlayerName: string,
    idGame: number,
    storage: any
) {

    const game = storage.find((g: any) => g.gameId === idGame);
    if (game) {
        game.firstPlayerName = firstPlayerName;
        game.secondPlayerName = secondPlayerName;
    }
}

export function createStartGameResponse(
    storage: any,
    idGame: number,
    currentPlayerIndex: number
) {
    console.log('response:', 'start_game');
    const gameStorage = storage.find((game) => game.gameId === idGame);

    const ships = currentPlayerIndex === 0
        ? gameStorage.firstPlayerShips
        : gameStorage.secondPlayerShips;

    const data = {
        ships,
        currentPlayerIndex,
    };
    return { type: 'start_game', data: JSON.stringify(data), id: 0 };
}

export function createTurnResponse(game: any) {
    const currentPlayer = game.currentPlayerIndex;
    console.log('response:', 'turn', currentPlayer);
    const data = {
        currentPlayer,
    };
    return {
        type: 'turn',
        data: JSON.stringify(data),
        id: 0,
    };
}

export function createFinishGameResponse(game: any) {
    console.log('response:', 'finish');
    const data = {
        winPlayer: game.currentPlayerIndex,
    };
    return {
        type: 'finish',
        data: JSON.stringify(data),
        id: 0,
    };
}

export function getWinnerNameIfFinished(game: any): string {
    if (game.firstPlayerKilledShipsCounter === TOTAL_SHIPS_TO_KILL) {
        return game.firstPlayerName;
    }
    if (game.secondPlayerKilledShipsCounter === TOTAL_SHIPS_TO_KILL) {
        return game.secondPlayerName;
    }
    return '';
}
