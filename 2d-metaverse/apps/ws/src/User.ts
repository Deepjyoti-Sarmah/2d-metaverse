import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutgoingMessage } from "./types";
import client from "@repo/db/client";
import { JWT_SECRET } from "./config";
import jwt, { JwtPayload } from "jsonwebtoken";

function generateRandomString(length: number) {
  const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += character.charAt(Math.floor(Math.random() * character.length));
  }
  return result;
}

export class User {
  public id: string;
  private spaceId?: string;
  public userId?: string;
  private x: number;
  private y: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.id = generateRandomString(10);
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.initHandlers();
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      console.log("data", data)
      const parseData = JSON.parse(data.toString());
      console.log("parseData", parseData)

      switch (parseData.type) {
        case "join":

          console.log("join received 1")
          const spaceId = parseData.payload.spaceId;
          const token = parseData.payload.token;
          const userId = (jwt.verify(token, JWT_SECRET) as JwtPayload).userId
          if (!userId) {
            this.ws.close();
            return;
          }

          console.log("join received 1")
          this.userId = userId;

          const space = await client.space.findFirst({
            where: {
              id: spaceId
            }
          });
          if (!space) {
            this.ws.close()
            return;
          }

          console.log("join received 1")
          this.spaceId = spaceId;
          RoomManager.getInstance().addUser(spaceId, this);
          this.x = Math.floor(Math.random() * space?.width);
          this.y = Math.floor(Math.random() * space?.height!);

          this.send({
            type: "space-joined",
            payload: {
              spawn: {
                x: this.x,
                y: this.y
              },
              users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.id !== this.id)?.map((u) => ({ id: u.id })) ?? []
            }
          });

          console.log("join received 1")
          RoomManager.getInstance().broadcast({
            type: "user-joined",
            payload: {
              userId: this.userId,
              x: this.x,
              y: this.y
            }
          }, this, this.spaceId!);
          break;

        case "move":
          const moveX = parseData.payload.x;
          const moveY = parseData.payload.y;

          const xDisplacement = Math.abs(this.x - moveX);
          const yDisplacenent = Math.abs(this.y - moveY);

          if ((xDisplacement == 1 && yDisplacenent == 0) || (xDisplacement == 0 && yDisplacenent == 1)) {
            this.x = moveX;
            this.y = moveY;

            RoomManager.getInstance().broadcast({
              type: "movement",
              payload: {
                x: this.x,
                y: this.y
              }
            }, this, this.spaceId!);
            return;
          }

          this.send({
            type: "movement-rejected",
            payload: {
              x: this.x,
              y: this.y
            }
          });
      }
    });
  }

  destroy() {
    RoomManager.getInstance().broadcast({
      type: "user-left",
      payload: {
        userId: this.userId
      }
    }, this, this.spaceId!);
    RoomManager.getInstance().removeUser(this, this.spaceId!);
  }

  send(payload: OutgoingMessage) {
    this.ws.send(JSON.stringify(payload));
  }
}
