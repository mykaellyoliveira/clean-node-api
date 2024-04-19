import { type EmailValidator } from '../presentation/protocols/email-validator'
import validator from 'validator'
// esse componente EmailValidatorAdapter será utilizado para encapsular o componente do validador de email
// Criando essa classe estamos isolando dos controladores a validação de e-mail, ou seja é possível utilizar separada
export class EmailValidatorAdapter implements EmailValidator {
  isValid (email: string): boolean {
    return validator.isEmail(email)
  }
}
