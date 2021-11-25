import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("Should be able to get statement an user", async () => {
    const userFake: ICreateUserDTO = {
      name: "any_name",
      email: "anyemail@mail.com",
      password: "any_password",
    };

    const user = await usersRepository.create(userFake);
    const user_id = user.id as string;

    const statementFake: ICreateStatementDTO = {
      user_id,
      description: "deposit in account",
      amount: 100,
      type: OperationType.DEPOSIT,
    };

    const statement = await statementsRepository.create(statementFake);
    const statement_id = statement.id as string;

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toHaveProperty("user_id", `${user_id}`);
    expect(statementOperation).toHaveProperty(
      "description",
      "deposit in account"
    );
    expect(statementOperation).toHaveProperty("amount", 100);
    expect(statementOperation).toHaveProperty("type", "deposit");
  });

  it("Should not be able to get statement an user if user not exists", async () => {
    const userFake: ICreateUserDTO = {
      name: "any_name",
      email: "anyemail@mail.com",
      password: "any_password",
    };

    const user = await usersRepository.create(userFake);
    const user_id = user.id as string;

    const statementFake: ICreateStatementDTO = {
      user_id,
      description: "deposit in account",
      amount: 100,
      type: OperationType.DEPOSIT,
    };

    const statement = await statementsRepository.create(statementFake);
    const statement_id = statement.id as string;

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "user_id_invalid",
        statement_id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });



  it("Should not be able to get statement an user if statement not found", async () => {
    const userFake: ICreateUserDTO = {
      name: "any_name",
      email: "anyemail@mail.com",
      password: "any_password",
    };

    const user = await usersRepository.create(userFake);
    const user_id = user.id as string;

    const statement_id = 'statement_id_invalid';

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
