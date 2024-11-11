import { Router } from "express";
import { CreateSpaceSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
    const parseData = CreateSpaceSchema.safeParse(req.body);

    if (!parseData.success) {
        res.status(400).json({
            message: "Validation Failed"
        });
        return;
    }

    try {
        if (!parseData.data.mapId) {
            const space = await client.space.create({
                data: {
                    name: parseData.data.name,
                    width: parseInt(parseData.data.description.split("x")[0]),
                    height: parseInt(parseData.data.description.split("x")[1]),
                    createrId: req.userId as string
                }
            });
            res.status(200).json({
                message: "Space created",
                spaceId: space.id
            });
            return;
        }

        const map = await client.map.findFirst({
            where: {
                id: parseData.data.mapId
            }, select: {
                mapElements: true,
                width: true,
                height: true
            }
        });

        if (!map) {
            res.status(400).json({
                message: "Map not found"
            });
            return;
        }

        let space = await client.$transaction(async () => {
            const space = await client.space.create({
                data: {
                    name: parseData.data.name,
                    width: map.width,
                    height: map.height,
                    createrId: req.userId!,
                }
            });

            await client.spaceElements.createMany({
                data: map.mapElements.map(e => ({
                    spaceId: space.id,
                    elementId: e.elementId as string,
                    x: e.x!,
                    y: e.y!
                }))
            })

            return space;
        });

        res.status(200).json({
            message: "Space created",
            spaceId: space.id
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
    try {
        const space = await client.space.findUnique({
            where: {
                id: req.params.spaceId
            }, select: {
                createrId: true
            }
        });

        if (!space) {
            res.status(400).json({
                message: "Space not found"
            });
            return;
        }

        if(space?.createrId !== req.userId) {
            res.status(403).json({
                message: "Unauthorized"
            });
            return;
        }

        await client.space.delete({
            where: {
                id: req.params.spaceId
            }
        });

        res.status(200).json({
            message: "Space deleted"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

spaceRouter.get("/all", (req, res) => {

});

spaceRouter.delete("/:spaceId", (req, res) => {

});

spaceRouter.post("/element", (req, res) => {

});

spaceRouter.get("/:spaceId", (req, res) => {

});
