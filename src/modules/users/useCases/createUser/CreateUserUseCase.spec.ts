import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Create User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })
  it('Should be able to create a new user', async () => {
    const userFake: ICreateUserDTO = {
      name: 'any name',
      email: 'any_email@mail.com',
      password: '1234'
    }

    const user = await createUserUseCase.execute(userFake)

    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('password')
    expect(user).toHaveProperty('name', 'any name')
    expect(user).toHaveProperty('email', 'any_email@mail.com')
  })
})
