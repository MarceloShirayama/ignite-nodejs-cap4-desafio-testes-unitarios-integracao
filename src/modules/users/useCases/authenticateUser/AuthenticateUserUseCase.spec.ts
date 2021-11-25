import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"

let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase

describe('Authenticate User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
  })

  it('Should be able to authenticate an user', async () => {
    const userFake: ICreateUserDTO = {
      name: 'any name',
      email: 'any_email@mail.com',
      password: 'any_password'
    }

    await createUserUseCase.execute(userFake)

    const token = await authenticateUserUseCase.execute(
      { email: userFake.email, password: userFake.password}
    )

    expect(token).toHaveProperty('user.id')
    expect(token).toHaveProperty('token')
    expect(token).toHaveProperty('user.name', 'any name')
    expect(token).toHaveProperty('user.email', 'any_email@mail.com')
  })



  it('Should not be able to authenticate an nonexistent user', async () => {
    expect(async () => {
      const userFake: ICreateUserDTO = {
        name: 'any name',
        email: 'any_email@mail.com',
        password: 'any_password'
      }

      const token = await authenticateUserUseCase.execute(
        { email: userFake.email, password: userFake.password}
      )
    }).rejects.toBeInstanceOf(AppError)
  })
})
