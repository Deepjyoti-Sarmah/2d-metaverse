import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { NextFunction, Request, Response } from "express";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];

    if (!token) {
        res.status(403).json({
            message: "Unauthorized"
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { role: string, userId: string };

        // if (decoded.role !== "User") {
        //     res.status(403).json({
        //         message: "Unauthorized"
        //     });
        //     return;
        // }

        req.userId = decoded.userId;
        next()
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
}