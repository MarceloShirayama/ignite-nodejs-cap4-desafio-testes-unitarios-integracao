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

const { email, password } = userFake;

describe("AuthenticateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await request(app).post("/api/v1/users").send(userFake);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    connection.close;
  });

  it("Should be able authenticate an user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });

    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user.id");
    expect(response.body).toHaveProperty("user.name", "any name");
    expect(response.body).toHaveProperty("user.email", "any_email@mail.com");
  });

  it("Should not be able authenticate an user with incorrect password", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password: 'invalid_password' });

    expect(response.status).toEqual(401)
    expect(response.body).toEqual({"message": "Incorrect email or password"})
  });
});
