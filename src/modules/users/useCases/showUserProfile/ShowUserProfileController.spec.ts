import { Response } from "superagent";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let connection: Connection;

const userFake: ICreateUserDTO = {
  name: "any name",
  email: "any_email@mail.com",
  password: "any_password",
};

let responseAuthenticate: Response;

const { email, password } = userFake;

describe("ShowUserProfileController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await request(app).post("/api/v1/users").send(userFake);
    responseAuthenticate = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    connection.close;
  });

  it("Should be able show user profile", async () => {
    const { token } = responseAuthenticate.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .send()
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", "any name");
    expect(response.body).toHaveProperty("email", "any_email@mail.com");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("Should not be able show user profile if not authenticate user", async () => {
    const token = "invalid_token";
    const response = await request(app)
      .get("/api/v1/profile")
      .send()
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: "JWT invalid token!" });
  });
});
