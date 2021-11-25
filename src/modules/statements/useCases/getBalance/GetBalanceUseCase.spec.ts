import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Get Balance Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to get the user balance.", async () => {
    const userFake: ICreateUserDTO = {
      name: "any_name",
      email: "anyemail@mail.com",
      password: "any_password",
    };

    const user = await createUserUseCase.execute(userFake)
    const user_id = user.id as string

    const balance = await getBalanceUseCase.execute({ user_id })

    expect(balance.statement).toEqual([])
    expect(balance.balance).toEqual(0)
  });

  it("Should not be able to get the user balance if user not found.", async () => {
    const user_id = 'user_id_invalid'

    expect(async () => {
      const balance = await getBalanceUseCase.execute({ user_id })
    }).rejects.toBeInstanceOf(AppError)
  });
});
