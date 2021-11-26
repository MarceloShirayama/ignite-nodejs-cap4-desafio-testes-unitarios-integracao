import { Response } from "superagent";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

let connection: Connection;

const userFake: ICreateUserDTO = {
  name: "any name",
  email: "any_email@mail.com",
  password: "any_password",
};

let responseAuthenticate: Response;

const { email, password } = userFake;

describe("CreateStatementController.", () => {
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

  it("Should be able create deposit statement", async () => {
    const { token } = responseAuthenticate.body;

    const deposit = {
      description: "deposit in account",
      amount: 100,
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("description", "deposit in account");
    expect(response.body).toHaveProperty("amount", 100);
    expect(response.body).toHaveProperty("type", "deposit");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("Ensure CreateStatementController not be able create deposit statement if not authenticate user", async () => {
    const token = "invalid_token";

    const deposit = {
      description: "deposit in account",
      amount: 100,
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "JWT invalid token!" });
  });

  it("Should be able create withdraw statement", async () => {
    const { token } = responseAuthenticate.body;

    const withdraw = {
      description: "withdraw in account",
      amount: 100,
    };

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("description", "withdraw in account");
    expect(response.body).toHaveProperty("amount", 100);
    expect(response.body).toHaveProperty("type", "withdraw");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("Ensure CreateStatementController not be able create withdraw statement if not authenticate user", async () => {
    const token = "invalid_token";

    const withdraw = {
      description: "withdraw in account",
      amount: 100,
    };

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "JWT invalid token!" });
  });

  it("Should not be able create withdraw statement if not funds", async () => {
    const { token } = responseAuthenticate.body;

    const withdraw = {
      description: "withdraw in account",
      amount: 100,
    };

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Insufficient funds" });
  });
});
