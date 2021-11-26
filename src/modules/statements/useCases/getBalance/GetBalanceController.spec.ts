import request from "supertest";
import { Response } from "superagent";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";

let connection: Connection;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let responseAuthenticate: Response;
let token: string;
let user_id: string;

const userFake: ICreateUserDTO = {
  name: "any name",
  email: "any_email@mail.com",
  password: "any_password",
};

const deposit = {
  description: "deposit in account",
  amount: 500,
};

const withdraw = {
  description: "withdraw in account",
  amount: 100,
};

const { email, password } = userFake;

describe("GetBalanceController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    await request(app).post("/api/v1/users").send(userFake);
    responseAuthenticate = await request(app)
      .post("/api/v1/sessions")
      .send({ email, password });
    token = responseAuthenticate.body.token;
    user_id = responseAuthenticate.body.user.id;
    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({ authorization: `Bearer ${token}` });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({ authorization: `Bearer ${token}` });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    connection.close;
  });

  it("Should be able to get balance", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .send(user_id)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");
  });
});
