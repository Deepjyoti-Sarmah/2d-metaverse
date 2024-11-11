import { Router } from "express";
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../types";
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

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
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

        if (space?.createrId !== req.userId) {
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

spaceRouter.get("/all", userMiddleware, async (req, res) => {
    try {
        const spaces = await client.space.findMany({
            where: {
                createrId: req.userId
            }
        });

        if (!spaces) {
            res.status(400).json({
                message: "Spaces doesn't exists"
            });
            return;
        }

        res.status(200).json({
            spaces: spaces.map(s => ({
                id: s.id,
                name: s.name,
                thumbnail: s.thumbnail,
                dimensions: `${s.width}x${s.height}`,
            }))
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
    const parseData = DeleteElementSchema.safeParse(req.body);
    if (!parseData.success) {
        res.status(400).json({
            message: "Validation failed"
        });
        return;
    }

    try {
        const spaceElements = await client.spaceElements.findFirst({
            where: {
                id: parseData.data.id
            }, include: {
                space: true
            }
        });

        if (!spaceElements?.space.createrId || spaceElements.space.createrId != req.userId) {
            res.status(403).json({
                message: "Unauthorized"
            });
            return;
        }

        await client.spaceElements.delete({
            where: {
                id: parseData.data.id
            }
        });

        res.status(200).json({
            message: "Element deleted"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

spaceRouter.post("/element", userMiddleware, async (req, res) => {
    const parseData = AddElementSchema.safeParse(req.body);
    if (!parseData.success) {
        res.status(400).json({
            message: "Validation failed"
        });
        return;
    }

    try {
        const space = await client.space.findUnique({
            where: {
                id: req.body.spaceId,
                createrId: req.userId!
            }, select: {
                width: true,
                height: true
            }
        });

        if (!space) {
            res.status(400).json({
                message: "Space not found"
            });
            return;
        }

        if (req.body.x < 0 || req.body.y < 0 || req.body.x > space?.width! || req.body.y > space?.height!) {
            res.status(400).json({
                message: "Point is outside of the boundary"
            });
            return;
        }

        await client.spaceElements.create({
            data: {
                spaceId: req.body.spaceId,
                elementId: req.body.elementId,
                x: req.body.x,
                y: req.body.y
            }
        });

        res.status(200).json({
            message: "Element added"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

spaceRouter.get("/:spaceId", async (req, res) => {
    try {
        const space = await client.space.findUnique({
            where: {
                id: req.params.spaceId
            },
            include: {
                elements: {
                    include: {
                        element: true
                    }
                },
            }
        });

        if (!space) {
            res.status(400).json({
                message: "Space not found"
            });
            return;
        }

        res.status(200).json({
            "dimensions": `${space.width}x${space.height}`,
            elements: space.elements.map(e => ({
                id: e.id,
                element: {
                    id: e.element.id,
                    imageUrl: e.element.imageUrl,
                    width: e.element.width,
                    height: e.element.height,
                    static: e.element.static
                },
                x: e.x,
                y: e.y
            })),
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
