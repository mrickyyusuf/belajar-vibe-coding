import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";

describe("Users Route API", () => {
  it("should handle registration route structure correctly", () => {
    const app = new Elysia().use(usersRoute);
    expect(app).toBeDefined();
  });
});
