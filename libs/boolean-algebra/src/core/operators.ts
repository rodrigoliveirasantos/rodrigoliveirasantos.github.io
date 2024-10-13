import { OperatorNotFoundError } from "../errors/operator-not-found-error";

type OperatorsMap = Map<string, Operator>;

export class Operator {
    constructor(
        public token: string,
        public precedence: number,
        public args: number,
        public handle: (...args: number[]) => number 
    ) {}
}

function makeOperatorsMap(operators: Operator[]): OperatorsMap {
    return new Map(operators.map((operator) => [operator.token, operator]))
}

export const PARENTESIS_OPEN = new Operator('(', -1, 0, () => 0);
export const PARENTESIS_CLOSE = new Operator(')', -1, 0, () => 0);
export const OR = new Operator('+',  1, 2, (a, b) => a | b);
export const AND = new Operator('.',  3, 2, (a, b) => a & b);
export const XOR = new Operator('^',  4, 2, (a, b) => a ^ b);
export const XNOR = new Operator('==', 4, 2, (a, b) => (a ^ b) ? 0 : 1);
export const NOT = new Operator("~",  5, 1, (a)    => a ? 0 : 1);

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
export const OPERATORS = [
    PARENTESIS_CLOSE,
    PARENTESIS_OPEN,
    OR,
    AND,
    XOR,
    XNOR,
    NOT,
].sort((a, b) => {
    return b.token.length - a.token.length;
});

const OPERATORS_MAP: OperatorsMap = makeOperatorsMap(OPERATORS);

export function getOperatorByToken(token: string) {
    return OPERATORS_MAP.get(token)
}

export function getAssertedOperatorByToken(token: string) {
    const operator = getOperatorByToken(token);
    if (!operator) {
        throw new OperatorNotFoundError(token);
    }
    return operator;
}

export function operatorExists(token: string) {
    return OPERATORS_MAP.has(token);
}
