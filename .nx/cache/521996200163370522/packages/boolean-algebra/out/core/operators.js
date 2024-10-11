"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATORS_MAP = exports.OPERATORS = exports.NOT = exports.XNOR = exports.XOR = exports.AND = exports.OR = exports.PARENTESIS_CLOSE = exports.PARENTESIS_OPEN = exports.Operator = void 0;
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
exports.PARENTESIS_OPEN = new Operator('(', -1, 0, () => 0);
exports.PARENTESIS_CLOSE = new Operator(')', -1, 0, () => 0);
exports.OR = new Operator('+', 1, 2, (a, b) => a | b);
exports.AND = new Operator('.', 3, 2, (a, b) => a & b);
exports.XOR = new Operator('^', 4, 2, (a, b) => a ^ b);
exports.XNOR = new Operator('==', 4, 2, (a, b) => (a ^ b) ? 0 : 1);
exports.NOT = new Operator("~", 5, 1, (a) => a ? 0 : 1);
/**
 * Operadores válidos. Eles são ordenados pelo tamanho do token
 * decrescente.
 *
 * @todo Remover o ( e ) da lista de operadores.
 */
/*
* Por mais que não seja realmente operadores, o abre-parentesis e
* o fecha-parentesis foram adicionados nesta lista para que fosse
* mais fácil de identificar. Coma a implementação do Token não é
* mais necessário.
*/
exports.OPERATORS = [
    exports.PARENTESIS_CLOSE,
    exports.PARENTESIS_OPEN,
    exports.OR,
    exports.AND,
    exports.XOR,
    exports.XNOR,
    exports.NOT,
].sort((a, b) => {
    return b.token.length - a.token.length;
});
exports.OPERATORS_MAP = makeOperatorsMap(exports.OPERATORS);
