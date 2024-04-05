import { SignUpController } from './signup'
describe('SignUp Controller', () => {
  test('Should return 400 if no name is provided', () => {
    // irá testar se a rota retorna 400 caso o nome não seja passado no body
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })
})
