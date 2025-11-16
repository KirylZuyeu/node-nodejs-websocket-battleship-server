import { BOARD_SIZE } from "../constants/constants";
function getRandomCoords(): [number, number] {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    return [x, y];
}

function evaluateShot(
    shipsMatrix: any,
    x: number,
    y: number,
    shots: any,
    temporaryAttackResults: any
): string {
    const shipAtLocation = shipsMatrix[y][x];

    if (!shipAtLocation || !shipAtLocation.length) {
        return 'miss';
    }

    shots[y][x] = 'shot';

    const isKilled = shipAtLocation.every((shipCell: [number, number]) => {
        const [cellY, cellX] = shipCell;
        return shots[cellY][cellX] === 'shot';
    });

    if (isKilled) {
        for (const [cellY, cellX] of shipAtLocation) {
            shots[cellY][cellX] = 'killed';
            temporaryAttackResults.push({ x: cellX, y: cellY, status: 'killed' });
        }

        const killedCellsCopy = [...temporaryAttackResults];

        killedCellsCopy.forEach((cell: { x: number, y: number, status: string }) => {
            for (let i = cell.x - 1; i <= cell.x + 1; i++) {
                for (let j = cell.y - 1; j <= cell.y + 1; j++) {

                    if (i >= 0 && i < BOARD_SIZE && j >= 0 && j < BOARD_SIZE) {
if (!shots[j][i]) {
                            temporaryAttackResults.push({ x: i, y: j, status: 'miss' });
                            shots[j][i] = 'miss';
                        }
                    }
                }
            }
        });

        return 'killed';
    }
    return 'shot';
}

export function processAttack(
    x: number,
    y: number,
    indexPlayer: number,
    game: any
): string | undefined {
    game.temporaryAttackResults.length = 0;

    const isPlayerTwo = !!indexPlayer;

    const [targetShipsMatrix, targetShots, killedCounterName] = isPlayerTwo
        ? [game.firstPlayerShipsMatrix, game.secondPlayerShots, 'secondPlayerKilledShipsCounter']
        : [game.secondPlayerShipsMatrix, game.firstPlayerShots, 'firstPlayerKilledShipsCounter'];

    if (targetShots[y][x]) {
        return undefined;
    }

    const result = evaluateShot(targetShipsMatrix, x, y, targetShots, game.temporaryAttackResults);

    if (result === 'killed') {
        game[killedCounterName]++;
        console.log(`${killedCounterName}: ${game[killedCounterName]}`);
    }
    return result;
}

export function selectRandomTarget(game: any, indexPlayer: number): [number, number] {
    const targetShots = indexPlayer
        ? game.secondPlayerShots
        : game.firstPlayerShots;

    while (true) {
        const [x, y] = getRandomCoords();
        if (!targetShots[y][x]) {
            return [x, y];
        }
    }
}


export function createAttackResponse(
    x: number,
    y: number,
    indexPlayer: number,
    result: string
) {
    console.log(
        'response:',
        'attack',
        `{x:${x}, y:${y}}, indexPlayer: ${indexPlayer}, result: ${result}`
    );

    const data = { position: { x, y }, currentPlayer: indexPlayer, status: result };
    return { type: 'attack', data: JSON.stringify(data), id: 0 };
}

type AttackResponseType = {
    type: string;
    data: string;
    id: 0;
};


export function createSurroundingMissesResponses(
    indexPlayer: number,
    game: any
): AttackResponseType[] {
    const responses: AttackResponseType[] = [];
    const { temporaryAttackResults } = game;
    temporaryAttackResults.forEach((i: { x: number, y: number, status: string }) =>
        responses.push({
            type: 'attack',
            data: JSON.stringify({
                position: { x: i.x, y: i.y },
                currentPlayer: indexPlayer,
                status: i.status,
            }),
            id: 0,
        })
    );
    return responses;
}
