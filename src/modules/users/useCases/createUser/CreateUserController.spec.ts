import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { ICreateUserDTO } from "./ICreateUserDTO";

let connection: Connection;

describe("CreateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    connection.close;
  });

  it("Should be able to create a new user", async () => {
    const userFake: ICreateUserDTO = {
      name: "any name",
      email: "any_email@mail.com",
      password: "any_password",
    };

    await request(app).post("/api/v1/users").send(userFake).expect(201);
  });
});
