import { type EmailValidator, type AccountModel, type AddAccount, type AddAccountModel } from './signup-protocols'
import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../../errors'

// COLOCAR NO NOTION DPS
// BOA PRATICA PARA CRIAR MOCKS
// SEMPRE INICIALIZAR COM UM VALOR POSITIVO PARA N AFETAR OS OUTROS TESTES
// ONDE QUISER QUE ELE FALHE MOCKA PARA ELE FALHAR

const makeEmailValidator = (): EmailValidator => {
  // stub é um tipo de mock que existe -> onde pega uma função e da uma retorno fixo p ela
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeAddAccount = (): AddAccount => {
  // stub é um tipo de mock que existe -> onde pega uma função e da uma retorno fixo p ela
  class AddAccountStub implements AddAccount {
    add (account: AddAccountModel): AccountModel {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
      return fakeAccount
    }
  }
  return new AddAccountStub()
}

// interface criada para definir o tipo do retorno do makeSut
interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
}
// utilizando esse factory "make" para se começarmos a adicionar dependencias no nosso controller n será
// necessario alterar todos os testes ex SignUpController(dependencia)
const makeSut = (): SutTypes => {
  const addAccountStub = makeAddAccount()
  const emailValidatorStub = makeEmailValidator()
  const sut = new SignUpController(emailValidatorStub, addAccountStub)
  // esse return foi criado pois o método isvalid precisa ser mockado de uma maneira q não de erro pois se n todos os testes q utilizam
  // o makesut vão retornar o erro de email invalido
  // ou seja ele precisa retornar true significando q o email é valido, porém para validarmos em um teste q vai dar um erro caso seja invalido precisamos
  // fazer o mock ao contrario para retornar invalido, por isso estamos retornando ele separado
  return {
    sut,
    emailValidatorStub,
    addAccountStub
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

  // irá testar se a rota retorna 400 caso a confirmação da senha seja diferente da senha
  test('Should return 400 if password confirmation fails', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'invalid_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
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

  // irá testar se o método isValid retornar uma exception iremos retornar um erro 500
  test('Should return 500 if EmailValidator throws', () => {
    const { sut, emailValidatorStub } = makeSut()
    // utilizado para alterar e mockar a implementação do isValid onde a função irá retornar um error
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
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

  // irá testar se o método addAcount está recebendo os valores corretos
  test('Should call AddCount witch correct values', () => {
    const { sut, addAccountStub } = makeSut()
    // utilizado para capturar o retorno do isValid (espionando o método)
    const addSpy = jest.spyOn(addAccountStub, 'add')
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  // irá testar se o método add retornar uma exception iremos retornar um erro 500
  test('Should return 500 if AddAccount throws', () => {
    const { sut, addAccountStub } = makeSut()
    // utilizado para alterar e mockar a implementação do isValid onde a função irá retornar um error
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
      throw new Error()
    })
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
