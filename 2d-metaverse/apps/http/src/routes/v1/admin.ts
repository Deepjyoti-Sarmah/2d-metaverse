import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types";
import client from "@repo/db/client"

export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req, res) => {
  const parseData = CreateElementSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Validation failed"
    });
    return;
  }

  try {
    const element = await client.element.create({
      data: {
        imageUrl: parseData.data.imageUrl,
        width: parseData.data.width,
        height: parseData.data.height,
        static: parseData.data.static
      }
    });

    if (!element) {
      res.status(400).json({
        message: "Element not created"
      });
      return
    }

    res.status(200).json({
      id: element.id
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

adminRouter.put("/element/:elementId", adminMiddleware, async (req, res) => {
  const parseData = UpdateElementSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Validation failed"
    });
    return;
  }

  try {
    const updateElement = await client.element.update({
      where: {
        id: req.params.elementId
      }, data: {
        imageUrl: parseData.data.imageUrl
      }
    });

    if (!updateElement) {
      res.status(400).json({
        message: "Not able to update element"
      });
      return;
    }

    res.status(200).json({
      imageUrl: updateElement.imageUrl
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

adminRouter.post("/avatar", adminMiddleware, async (req, res) => {
  const parseData = CreateAvatarSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Validation failed"
    });
    return;
  }

  try {
    const avatar = await client.avatar.create({
      data: {
        imageUrl: parseData.data.imageUrl,
        name: parseData.data.name
      }
    });

    console.log(avatar)

    if (!avatar) {
      res.status(400).json({
        message: "Cannot create an avatar"
      });
      return;
    }

    res.status(200).json({
      avatarId: avatar.id
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

adminRouter.post("/map", adminMiddleware, async (req, res) => {
  const parseData = CreateMapSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Validation failed"
    });
    return;
  }

  try {
    const map = await client.map.create({
      data: {
        thumbnail: parseData.data.thumbnail,
        name: parseData.data.name,
        width: parseInt(parseData.data.dimensions.split("x")[0]),
        height: parseInt(parseData.data.dimensions.split("x")[1]),
        mapElements: {
          create: parseData.data.defaultElements.map(e => ({
            elementId: e.elementId,
            x: e.x,
            y: e.y
          }))
        }
      }
    });

    res.status(200).json({
      id: map.id
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
});
