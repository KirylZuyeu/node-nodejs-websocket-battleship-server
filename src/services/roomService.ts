import { RawData } from 'ws';

function reindexRooms(storage: any[]): void {
    storage.forEach((room, index) => {
        room.roomId = index;
    });
}

export function getRoomIndexFromMessage(message: RawData): number {

    return JSON.parse(JSON.parse(message.toString()).data).indexRoom;
}

export function createRoomUpdateResponse(storage: any): any {
    console.log('response:', 'update_room');
    return { type: 'update_room', data: JSON.stringify(storage), id: 0 };
}


export function removeRoomByIndex(
    storage: any[],
    roomIndex: number
): void {

    if (roomIndex >= 0 && roomIndex < storage.length) {
        storage.splice(roomIndex, 1);
        reindexRooms(storage);
    }

}


export function removeUserCreatedRoom(
    storage: any[],
    userName: string
): void {

    const roomToDeleteIndex = storage.findIndex(
        (room) => room.roomUsers[0].name === userName
    );

    if (roomToDeleteIndex !== -1) {
        storage.splice(roomToDeleteIndex, 1);
        reindexRooms(storage);
    }
}
