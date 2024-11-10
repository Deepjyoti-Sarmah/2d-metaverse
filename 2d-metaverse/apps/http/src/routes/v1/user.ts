import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client";

export const userRouter =Router();

userRouter.post("/metadata", (req, res) => {
    const parseData = UpdateMetadataSchema.safeParse(req.body);

    if(!parseData.success) {
        res.status(400).json({
            message: "Validation failed"
        });
        return;
    }

    await client.user.update({
        where: {

        }
    })

    

});

userRouter.get("/metadata/bulk", (req, res) => {

});
