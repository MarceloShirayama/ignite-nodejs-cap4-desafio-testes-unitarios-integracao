import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let usersRepository: IUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: IStatementsRepository
let createUserUseCase: CreateUserUseCase

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it("Should be able to create a new deposit statement", async () => {
    const userFake: ICreateUserDTO = {
      name: 'any name',
      email: 'any_email@mail.com',
      password: 'any_password'
    }

    const user = await createUserUseCase.execute(userFake)

    const user_id = user.id as string

    const statementFake: ICreateStatementDTO = {
      user_id,
      description: "deposit in account",
      amount: 100,
      type: OperationType.DEPOSIT,
    };

    const deposit = await createStatementUseCase.execute(statementFake)

    expect(deposit).toHaveProperty('id')
    expect(deposit).toHaveProperty('type', 'deposit')
    expect(deposit).toHaveProperty('amount', 100)
  });

  it("Should be able to create a new withdraw statement", async () => {
    const userFake: ICreateUserDTO = {
      name: 'any name',
      email: 'any_email@mail.com',
      password: 'any_password'
    }

    const user = await createUserUseCase.execute(userFake)

    const user_id = user.id as string

    const depositStatementFake: ICreateStatementDTO = {
      user_id,
      description: "deposit in account",
      amount: 100,
      type: OperationType.DEPOSIT,
    };

    const withdrawStatementFake: ICreateStatementDTO = {
      user_id,
      description: "withdraw in account",
      amount: 100,
      type: OperationType.WITHDRAW,
    };

    await createStatementUseCase.execute(depositStatementFake)
    const withdraw = await createStatementUseCase.execute(withdrawStatementFake)

    expect(withdraw).toHaveProperty('id')
    expect(withdraw).toHaveProperty('type', 'withdraw')
    expect(withdraw).toHaveProperty('amount', 100)
  });

  it("Should not be able to create a new withdraw statement if insufficient Funds in balance", async () => {
    const userFake: ICreateUserDTO = {
      name: 'any name',
      email: 'any_email@mail.com',
      password: 'any_password'
    }

    const user = await createUserUseCase.execute(userFake)

    const user_id = user.id as string

    const withdrawStatementFake: ICreateStatementDTO = {
      user_id,
      description: "withdraw in account",
      amount: 100,
      type: OperationType.WITHDRAW,
    };

    expect(async () => {
      await createStatementUseCase.execute(withdrawStatementFake)
    }).rejects.toBeInstanceOf(AppError)
  });

  it("Should not be able to create a new statement if user not found", async () => {
    const user_id = 'user_id_invalid'

    const statementFake: ICreateStatementDTO = {
      user_id,
      description: "deposit in account",
      amount: 100,
      type: OperationType.DEPOSIT,
    };

    expect(async () => {
      await createStatementUseCase.execute(statementFake)
    }).rejects.toBeInstanceOf(AppError)
  });
});
