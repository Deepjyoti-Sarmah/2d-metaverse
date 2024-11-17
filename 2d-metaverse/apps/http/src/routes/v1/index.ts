import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { SigninSchema, SignupScheme } from "../../types";
import client from "@repo/db/client";
import { hash, compare } from "../../scrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

export const router = Router();

router.post("/signup", async (req, res) => {
  const parseData = SignupScheme.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Validation failed"
    });
    return;
  }

  const hashedPassword = await hash(parseData.data.password);

  try {
    const user = await client.user.create({
      data: {
        username: parseData.data.username,
        password: hashedPassword,
        role: parseData.data?.type === "admin" ? "Admin" : "User",
      }
    });

    res.json({
      userId: user.id
    });
  } catch (error: any) {
    res.status(400).json({
      message: "User already exists",
      error: error.message
    });
  }
});

router.post("/signin", async (req, res) => {
  const parseData = SigninSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(403).json({
      message: "Validation failed"
    });
    return;
  }

  try {
    const user = await client.user.findUnique({
      where: {
        username: parseData.data.username
      }
    });

    if (!user) {
      res.status(403).json({
        message: "User not found"
      });
      return;
    }

    const isValid = await compare(parseData.data.password, user.password);

    if (!isValid) {
      res.status(403).json({
        message: "Invalid Password"
      });
      return;
    }

    const token = jwt.sign({
      userId: user.id,
      role: user.role
    }, JWT_SECRET);

    res.status(200).json({
      token: token
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

router.get("/element", async (req, res) => {
  try {
    const elements = await client.element.findMany()

    if (!elements) {
      res.status(400).json({
        message: "elements not found"
      });
      return;
    }

    res.status(200).json({
      elements: elements.map(e => ({
        id: e.id,
        imageUrl: e.imageUrl,
        width: e.width,
        height: e.height,
        static: e.static
      }))
    });
  } catch (error) {
    res.status(200).json({
      message: "Internal server error"
    });
  }
});

router.get("/avatars", async (req, res) => {
  try {
    const avatars = await client.avatar.findMany()
    if (!avatars) {
      res.status(400).json({
        message: "avatars not found"
      });
      return;
    }

    res.status(200).json({
      avatars: avatars.map(e => ({
        id: e.id,
        imageUrl: e.imageUrl,
        name: e.name
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
