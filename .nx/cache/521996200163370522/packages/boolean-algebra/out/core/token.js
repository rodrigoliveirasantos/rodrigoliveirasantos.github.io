"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
/**
 * Representa um símbolo da expressão. O valor do token pode ser
 * determinado pelo seu tipo e podem ser compostos por mais de um
 * caractere.
 *
 * @usage
 * ```js
 * const token: Token = tokens[0];
 *
 * switch (token.type) {
 *  case 'operator':
 *      OPERATORS_MAP.get(token.value as string).handle(0, 1);
 *      break;
 *  case 'parentesisOper':
 *  case 'parentesisClose':
 *      console.log('Parentesis: ' + token.value);
 *      break;
 *  default:
 *      throw new Error('Um token de tipo inesperado foi recebido.');
 * }
 * ```
 */
class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static unknown() {
        return new Token('unknown', '');
    }
    static parentesisOpen() {
        return new Token('parentesisOpen', '(');
    }
    static parentesisClose() {
        return new Token('parentesisClose', ')');
    }
    setType(type) {
        this.type = type;
    }
    setValue(value) {
        this.value = value;
    }
}
exports.Token = Token;
