import { RawData } from 'ws';
import dataBase from '../constants/storage';

type UserRegResponseData = {
    name: string;
    index: number;
    error: boolean;
    errorText: string;
};

type UserAuthData = {
    name: string;
    password: string;
};

function processRegistration(userAuthData: UserAuthData): UserRegResponseData {
    const response: UserRegResponseData = {
        name: userAuthData.name,
        index: 0,
        error: false,
        errorText: '',
    };

    if (dataBase.some((user) => user.name === userAuthData.name)) {
        response.error = true;
        response.errorText = 'Create Uniq Name';
        return response;
    }

    response.index = dataBase.length;
    dataBase.push(userAuthData);

    return response;
}

export function registerUser(message: RawData): any {
    const parsedMessage = JSON.parse(message.toString());
    const data: UserAuthData = JSON.parse(parsedMessage.data);

    const userRegResponseData = processRegistration(data);

    console.log('response:', parsedMessage.type);

    return {
        ...parsedMessage,
        data: JSON.stringify(userRegResponseData)
    };
}

export function getFirstPlayerInRoomName(
    storage: any,
    roomIndex: number
): string | undefined {
    const room = storage.find((r: any) => r.roomId === roomIndex);
    return room?.roomUsers[0]?.name;
}

export function updateWinnerStats(
    storage: any,
    winnerName: string
) {
    const winnerIndex = storage.findIndex((winner: any) => winner.name === winnerName);

    if (winnerIndex !== -1) {
        storage[winnerIndex].wins++;
    } else {
        storage.push({ name: winnerName, wins: 1 });
    }
}

export function createWinnersResponse(storage: any) {
    console.log('response:', 'update_winners');
    return { type: 'update_winners', data: JSON.stringify(storage), id: 0 };
}
