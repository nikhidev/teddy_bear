import { Hono } from "hono";
import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";

export const authRouter = new Hono();

authRouter.get("/getDatabaseSyncStatus", async (c) => {
    const auth = await currentUser();
    
    if (!auth) {
        return c.json({ isSynced: false }, 401); // Send 401 for unauthorized users
    }

    const user = await db.user.findFirst({
        where: { externalId: auth.id },
    });

    console.log("User in DB:", user);

    if (!user) {
        await db.user.create({
            data: {
                quotaLimit: 100,
                externalId: auth.id,
                email: auth.emailAddresses[0].emailAddress,
            },
        });
    }

    return c.json({ isSynced: true });
});
