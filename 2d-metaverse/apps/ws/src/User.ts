import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";

export class User {
    constructor(private ws: WebSocket) {

    }

    initHandlers() {
        this.ws.on("message", (data) => {
            const parseData = JSON.parse(data.toString());
            switch (parseData.type) {
                case "join": {
                    const spaceId = parseData.payload.spaceId;
                    RoomManager.addUser(spaceId, this)
                }

                case "move": {

                }

            }
        })
    }
}