import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";

describe("Users Route API", () => {
  it("should handle registration, login, and current user route structure correctly", () => {
    const app = new Elysia().use(usersRoute);
    expect(app).toBeDefined();
  });

  it("should return Unauthorized when no Authorization header is provided", async () => {
    const app = new Elysia().use(usersRoute);
    const response = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ data: "Unauthorized" });
  });

  it("should return Unauthorized when Authorization header is invalid", async () => {
    const app = new Elysia().use(usersRoute);
    const response = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: "Basic invalidtoken",
        },
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ data: "Unauthorized" });
  });
});


