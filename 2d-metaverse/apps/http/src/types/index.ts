import z from "zod";

export const SignupScheme = z.object({
    username: z.string(),
    password: z.string(),
    type: z.enum(["user", "admin"])
});

export const SigninSchema = z.object({
    username: z.string(),
    password: z.string()
});

export const UpdateMetadataSchema = z.object({
    avatarId: z.string(),
});

export const CreateSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId: z.string().optional()
});

export const AddElementSchema = z.object({
    spaceId: z.string(),
    elementId: z.string(),
    x: z.number(),
    y: z.number()
});

export const CreateElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean()
});

export const UpdateElementSchema = z.object({
    imageUrl: z.string()
});

export const DeleteElementSchema = z.object({
    id: z.string(),
});

export const UserMetadataBulkSchema = z.object({
    ids: z.string().transform((val) => {
        // Remove outer square brackets if present
        const trimmed = val.trim().replace(/^\[|\]$/g, '');

        // Split by commas, then filter out any empty strings (in case of malformed input)
        return trimmed.split(',').map((id) => id.trim()).filter(Boolean);
    })
});

export const CreateAvatarSchema = z.object({
    imageUrl: z.string(),
    name: z.string(),
    // userId: z.string()
});

export const CreateMapSchema = z.object({
    thumbnail: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number(),
    })),
    name: z.string()
});

declare global {
    namespace Express {
        export interface Request {
            role?: "Admin" | "User";
            userId?: string;
        }
    }
}