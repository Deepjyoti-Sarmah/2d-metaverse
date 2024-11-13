import { Router } from "express";
import { UpdateMetadataSchema, UserMetadataBulkSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parseData = UpdateMetadataSchema.safeParse(req.body);

    if (!parseData.success) {
        res.status(400).json({
            message: "Validation failed"
        });
        return;
    }

    try {
        const metadata = await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parseData.data.avatarId
            }
        });

        if (!metadata) {
            res.status(400).json({
                message: "avatar was not updated"
            });
            return;
        }

        // console.log("user metadata",metadata);

        res.status(200).json({ message: "Metadata updated" });
    } catch (error) {
        res.status(400).json({
            message: "Internal server error"
        });
    }
});

userRouter.get("/metadata/bulk", async (req, res) => {
    // const userIdString = (req.query.ids ?? "[]") as string;
    // const userIds = (userIdString).slice(1, userIdString?.length - 1).split(",");

    const parseData = UserMetadataBulkSchema.safeParse(req.query);
    if (!parseData.success) {
        res.status(400).json({
            message: "Invalid query parameter"
        });
        return;
    }

    const userIds = parseData.data.ids;

    // console.log("userIds", userIds);

    try {
        const metadata = await client.user.findMany({
            where: {
                id: {
                    // in: userIds.map(String)
                    in: userIds
                }
            }, select: {
                avatar: true,
                id: true
            }
        });

        if(!metadata) {
            res.status(400).json({
                message: "avatar infomation from user not found"
            });
            return;
        }

        // console.log("metadata get", metadata);

        if (!metadata) {
            res.status(400).json({
                message: "metadata not found"
            });
            return;
        }

        res.status(200).json({
            avatars: metadata.map(m => ({
                userId: m.id,
                avatarId: m.avatar?.imageUrl
            }))
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
