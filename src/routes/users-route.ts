import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/users-service";

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
  );
