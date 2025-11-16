import { RawData } from 'ws';
// NB: dataBase должен быть импортирован из storageService, если это возможно,
// чтобы playerService не зависел напрямую от констант.
import dataBase from '../constants/storage';

// --- Типы для читаемости ---
// Используем Union Type для данных ответа, чтобы избежать дублирования
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

// --- Вспомогательная логика ---

/**
 * Проверяет уникальность имени и добавляет нового пользователя в базу данных.
 * (Ранее: auth)
 * @returns Объект UserRegResponseData с данными регистрации или ошибкой.
 */
function processRegistration(userAuthData: UserAuthData): UserRegResponseData {
    const response: UserRegResponseData = {
        name: userAuthData.name,
        index: 0,
        error: false,
        errorText: '',
    };

    // Проверка на уникальность имени
    if (dataBase.some((user) => user.name === userAuthData.name)) {
        response.error = true;
        response.errorText = 'Create Uniq Name';
        return response;
    }

    // Регистрация
    response.index = dataBase.length;
    dataBase.push(userAuthData);

    return response;
}

// --- Основные экспортируемые сервисы ---

/**
 * Обрабатывает запрос регистрации, парсит сообщение и возвращает ответ.
 * (Ранее: reg)
 */
export function registerUser(message: RawData): any {
    const parsedMessage = JSON.parse(message.toString());
    const data: UserAuthData = JSON.parse(parsedMessage.data);

    // Логика регистрации вынесена
    const userRegResponseData = processRegistration(data);

    console.log('response:', parsedMessage.type);

    // Возвращаем полный объект ответа, включая исходный тип
    return {
        ...parsedMessage,
        data: JSON.stringify(userRegResponseData)
    };
}

/**
 * Возвращает имя первого игрока (создателя) в комнате.
 * (Ранее: getPlayerInRoomName)
 */
export function getFirstPlayerInRoomName(
    storage: any, // RoomStorageType
    roomIndex: number
): string | undefined {
    const room = storage.find((r: any) => r.roomId === roomIndex);
    return room?.roomUsers[0]?.name; // Используем optional chaining для безопасности
}

/**
 * Обновляет статистику побед пользователя.
 * (Ранее: updateWinnersStorage)
 */
export function updateWinnerStats(
    storage: any, // WinnersStorageType
    winnerName: string
) {
    const winnerIndex = storage.findIndex((winner: any) => winner.name === winnerName);

    if (winnerIndex !== -1) {
        storage[winnerIndex].wins++;
    } else {
        storage.push({ name: winnerName, wins: 1 });
    }
}

/**
 * Создает ответ WebSocket с обновленным списком победителей.
 * (Ранее: updateWinners)
 */
export function createWinnersResponse(storage: any) {
    console.log('response:', 'update_winners');
    return { type: 'update_winners', data: JSON.stringify(storage), id: 0 };
}
