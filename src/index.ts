import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => ({ message: "Server is running smoothly!" }))
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return { success: true, data: allUsers };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  })
  .post(
    "/users",
    async ({ body }) => {
      try {
        const result = await db.insert(users).values({
          name: body.name,
          email: body.email,
        });
        return { success: true, message: "User created successfully", result };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
      }),
    }
  )
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
