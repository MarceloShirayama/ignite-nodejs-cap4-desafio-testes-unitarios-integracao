import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: IUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("Should be able to show user profile", async () => {
    const userFake: ICreateUserDTO = {
      name: "any_name",
      email: "anyemail@mail.com",
      password: "any_password",
    };

    const user = await usersRepository.create(userFake);
    const user_id = user.id as string;

    const userProfile = await showUserProfileUseCase.execute(user_id);

    expect(userProfile).toHaveProperty("id", user_id);
    expect(userProfile).toHaveProperty("name", userFake.name);
    expect(userProfile).toHaveProperty("email", userFake.email);
    expect(userProfile).toHaveProperty("password", userFake.password);
  });

  it("Should not be able to show user profile if user not exists", async () => {
    const user_id = "user_id_invalid";

    expect(async () => {
      await showUserProfileUseCase.execute(user_id);
    }).rejects.toBeInstanceOf(AppError);
  });
});
