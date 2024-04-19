import { EmailValidatorAdapter } from './email-validator-adapter'
import validator from 'validator'

jest.mock('validator', () => ({
  isEmail (): boolean {
    return true
  }
}))

// makeSut criado para não precisar importar em todos os testes o emailvalidatorAdapter e outras dependencias
const makeSut = (): EmailValidatorAdapter => {
  return new EmailValidatorAdapter()
}

describe('EmailValidator Adapter', () => {
// teste se passar um e-mail invalido vai retornar falso
  test('Should return false if validator returns false', () => {
    const sut = makeSut()
    // esta mockando o método isEmail para retornar false
    jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
    const isValid = sut.isValid('invalid_email')

    expect(isValid).toBe(false)
  })

  // teste se passar um e-mail valido vai retornar true
  test('Should return false if validator returns true', () => {
    const sut = makeSut()
    const isValid = sut.isValid('valid_email@mail.com')

    expect(isValid).toBe(true)
  })
  // garantir que o validator será chamado com o valor certo
  test('Should call validator with correct email', () => {
    const sut = makeSut()
    const isEmailSpy = jest.spyOn(validator, 'isEmail')
    sut.isValid('any_email@mail.com')
    expect(isEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
})
