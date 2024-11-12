import { Router } from "express";
import { UpdateMetadataSchema, UserMetadataBulkSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";
import { string } from "zod";

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
        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parseData.data.avatarId
            }
        });
        res.status(200).json({ message: "Metadata updated" });
    } catch (error) {
        res.status(400).json({
            message: "Internal server error"
        });
    }
});

userRouter.get("/metadata/bulk", async (req, res) => {
    const userIdString = (req.query.id ?? "[]") as string;
    const userIds = (userIdString).slice(1, userIdString?.length -1).split(",");

    // const parseQueryData = UserMetadataBulkSchema.safeParse(req.query);

    // if(!parseQueryData.success) {
    //     res.status(400).json({
    //         message: "Invalid query parameter"
    //     });
    //     return;
    // }

    // const userIds = parseQueryData.data.id.map(String);

    try {
        const metadata = await client.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            }, select: {
                avatar: true,
                id: true
            }
        });


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
