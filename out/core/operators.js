"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATORS_MAP = exports.OPERATORS = exports.Operator = void 0;
class Operator {
    constructor(token, precedence, args, handle) {
        this.token = token;
        this.precedence = precedence;
        this.args = args;
        this.handle = handle;
    }
}
exports.Operator = Operator;
function makeOperatorsMap(operators) {
    return new Map(operators.map((operator) => [operator.token, operator]));
}
/**
 * Operadores válidos. Eles são ordenados pelo tamanho do token
 * decrescente.
 */
exports.OPERATORS = [
    new Operator('(', -1, 0, () => 0),
    new Operator(')', -1, 0, () => 0),
    new Operator('+', 1, 2, (a, b) => a | b),
    new Operator('.', 3, 2, (a, b) => a & b),
    new Operator('^', 4, 2, (a, b) => a ^ b),
    new Operator('==', 4, 2, (a, b) => (a ^ b) ? 0 : 1),
    new Operator("~", 5, 1, (a) => a ? 0 : 1),
].sort((a, b) => {
    return b.token.length - a.token.length;
});
exports.OPERATORS_MAP = makeOperatorsMap(exports.OPERATORS);
