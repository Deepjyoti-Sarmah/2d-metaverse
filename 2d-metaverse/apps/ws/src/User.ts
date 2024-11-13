import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutgoingMessage } from "./types";
import client from "@repo/db/client";

function generateRandomString (length: number) {
    const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += character.charAt(Math.floor(Math.random() * character.length));
    }
    return result;
}

export class User {
    public id: string;

    constructor(private ws: WebSocket) {
        this.id = generateRandomString(10);
    }

    initHandlers() {
        this.ws.on("message", (data) => {
            const parseData = JSON.parse(data.toString());
            switch (parseData.type) {
                case "join": {
                    const spaceId = parseData.payload.spaceId;
                    RoomManager.getInstance().addUser(spaceId, this);
                }
            }
        });
    }

    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload));
    }
}