import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { ICreateUserDTO } from "./ICreateUserDTO";

let connection: Connection;

describe("CreateUserController", () => {
  const userFake: ICreateUserDTO = {
    name: "any name",
    email: "any_email@mail.com",
    password: "any_password",
  };

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    connection.close;
  });

  it("Should be able to create a new user", async () => {
    await request(app).post("/api/v1/users").send(userFake).expect(201);
  });

  it("Should not be able to create a new user with an already registered email", async () => {
    const response = await request(app).post("/api/v1/users").send(userFake);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "User already exists" });
  });
});
