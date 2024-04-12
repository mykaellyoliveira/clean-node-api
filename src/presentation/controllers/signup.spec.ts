import { type EmailValidator } from './../protocols/email-validator'
import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../errors'

// COLOCAR NO NOTION DPS
// BOA PRATICA PARA CRIAR MOCKS
// SEMPRE INICIALIZAR COM UM VALOR POSITIVO PARA N AFETAR OS OUTROS TESTES
// ONDE QUISER QUE ELE FALHE MOCKA PARA ELE FALHAR

// interface criada para definir o tipo do retorno do makeSut
interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
}
// utilizando esse factor se começarmos a adicionar dependencias no nosso controller, n será
// necessario alterar todos os testes  ex SignUpController(dependencia)
const makeSut = (): SutTypes => {
  // stub é um tipo de mock que existe -> onde pega uma função e da uma retorno fixo p ela
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub)
  // esse return foi criado pois o método isvalid precisa ser mockado de uma maneira q não de erro pois se n todos os testes q utilizam
  // o makesut vão retornar o erro de email invalido
  // ou seja ele precisa retornar true significando q o email é valido, porém para validarmos em um teste q vai dar um erro caso seja invalido precisamos
  // fazer o mock ao contrario para retornar invalido, por isso estamos retornando ele separado
  return {
    sut,
    emailValidatorStub
  }
}
describe('SignUp Controller', () => {
  // irá testar se a rota retorna 400 caso o nome não seja passado no body
  test('Should return 400 if no name is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  // irá testar se a rota retorna 400 caso o email não seja passado no body
  test('Should return 400 if no email is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  // irá testar se a rota retorna 400 caso a senha não seja passado no body
  test('Should return 400 if no password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  // irá testar se a rota retorna 400 caso a confirmação da senha não seja passado no body
  test('Should return 400 if no password confirmation is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  // irá testar se a rota retorna 400 caso o email seja invalido
  test('Should return 400 if an invalid email is provided', () => {
    const { sut, emailValidatorStub } = makeSut()
    // utilizado para alterar e mockar o retorno do método q era true para false
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  // irá testar se o método isValid do emailValidator está sendo chamado com o email correto
  test('Should call EmailValidator witch correct email', () => {
    const { sut, emailValidatorStub } = makeSut()
    // utilizado para capturar o retorno do isValid (espionando o método)
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    sut.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  // irá testar se o método retornar exception vai ser retornar um erro 500
  test('Should return 500 if EmailValidator throws', () => {
    class EmailValidatorStub implements EmailValidator {
      isValid (email: string): boolean {
        throw new Error()
      }
    }
    const emailValidatorStub = new EmailValidatorStub()
    const sut = new SignUpController(emailValidatorStub)
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
