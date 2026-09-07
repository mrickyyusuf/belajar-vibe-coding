import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post(
    "/",
    async ({ body }) => {
      return await registerUser(body.name, body.email, body.password);
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/login",
    async ({ body }) => {
      return await loginUser(body.email, body.password);
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get("/current", async ({ headers, set }) => {
    const authHeader = headers["authorization"] || headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { data: "Unauthorized" };
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      set.status = 401;
      return { data: "Unauthorized" };
    }

    const result = await getCurrentUser(token);
    if (result.data === "Unauthorized") {
      set.status = 401;
    }
    return result;
  });

