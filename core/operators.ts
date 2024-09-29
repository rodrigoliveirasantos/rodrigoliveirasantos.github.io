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

/**
 * Operadores válidos. Eles são ordenados pelo tamanho do token
 * decrescente.
 */
export const OPERATORS = [
    new Operator('(', -1, 0, () => 0),
    new Operator(')', -1, 0, () => 0),
    new Operator('+',  1, 2, (a, b) => a | b),
    new Operator('.',  3, 2, (a, b) => a & b),
    new Operator('^',  4, 2, (a, b) => a ^ b),
    new Operator('==', 4, 2, (a, b) => (a ^ b) ? 0 : 1),
    new Operator("~",  5, 1, (a)    => a ? 0 : 1),
].sort((a, b) => {
    return b.token.length - a.token.length;
});

export const OPERATORS_MAP: OperatorsMap = makeOperatorsMap(OPERATORS);