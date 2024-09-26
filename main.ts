type OperatorsMap  = {
    [symbol: string]: Operator
}

class Operator {
    constructor(
        public token: string,
        public precedence: number,
        public args: number,
        public handle: (...args: number[]) => number 
    ) {}
}

class Stack<T> {
    private items: T[];

    constructor(items: ArrayLike<T> = []) {
        this.items = [];
        for (let i = 0; i < items.length; i++) {
            this.push(items[i]);
        }
    }

    length() {
        return this.items.length;
    }

    empty() {
        return this.items.length === 0; 
    }

    push(item: T) {
        this.items.push(item);
    }

    top() {
        if (!this.items.length) {
            return undefined;
        }

        return this.items[this.items.length - 1];
    }

    pop() {
        return this.items.pop();
    }

    toString() {
        return JSON.stringify(this.items);
    }
}

function makeOperatorsMap(operators: Operator[]): OperatorsMap {
    return operators.reduce((acc, operator) => {
        return {
            ...acc,
            [operator.token]: operator
        }
    }, {} as OperatorsMap);
}

const operatorsMap: OperatorsMap = makeOperatorsMap([
    new Operator('(', -1, 0, () => 0),
    new Operator(')', -1, 0, () => 0),
    new Operator('+', 1, 2, (a, b) => a | b),
    new Operator('.', 2, 2, (a, b) => a & b),
    new Operator('^', 3, 2, (a, b) => a ^ b),
    new Operator("'", 4, 1, (a)    => a ? 1 : 0),
]);

function cleanUpExpression(exp: string) {
    return exp.trim().replace(/[\u0020\n]+/g, '');
}

function inversePolishNotation(
    input: string, 
    operators: OperatorsMap
) {
    const output: (string|Operator)[] = [];
    const operatorsStack = new Stack<Operator>();

    console.debug(">> Input: ", input)

    if (!input) {
        return { expression: [] };
    }
    
    for (let i = 0; i < input.length; i++) {
        const token = input.charAt(i);
        const newOperator = operators[token];
        const isOperator = !!newOperator 

        console.debug(">> Token: ", token);
        console.debug(">> Stack: ", operatorsStack);
        console.debug(">> Out: ", output);
        console.debug();

        // Qualquer não operador será considerado uma entrada ou valor fixo.
        if (!isOperator) {
            output.push(token);
            continue;
        }

        if (newOperator.token === ')') {
            // Busca o abre parenteses.
            while (
                !operatorsStack.empty() &&
                operatorsStack.top().token !== '('
            ) {
                output.push(operatorsStack.pop());
            }   

            // Se o operatorsStack está vazio, é porque o ( não foi encontrado.
            if (operatorsStack.empty()) {
                return { error: 'Fecha-parenteses sem um abre-parenteses correspondente.' }
            }

            // Descarta o abre-parenteses.
            operatorsStack.pop();
            continue;
        }

        while (!operatorsStack.empty()) {
            const topOperator = operatorsStack.top();

            // Se for o parenteses, ou o novo operador tem a precedencia menor
            // então ele deveria entrar no topo da pilha mesmo.
            if (
                newOperator.token === '(' ||
                topOperator.precedence < newOperator.precedence
            ) {
                break;
            }

            // Move o operador que estava no topo para o output
            output.push(topOperator);
            operatorsStack.pop();
        }

        operatorsStack.push(newOperator);
    }

    while (!operatorsStack.empty()) {
        if (operatorsStack.top().token === '(') {
            return { error: 'Encontrado abre-parentesis sem um fecha-parentesis correspondente.' }
        }

        output.push(operatorsStack.pop()!);
    }

    return { expression: output }
}

function solver(input: (Operator|string)[], context: Map<string, number>) {
    const solutionStack = new Stack<number|Operator>();

    console.log(">> Resolvendo: ", input);
    console.log(">> Contexto: ", context);
 
    for (let i = 0; i < input.length; i++) {
        const symbol = input[i];

        // Se passar é um operando.
        if (typeof symbol === 'string') {
            if (symbol === '0' || symbol === '1') {
                solutionStack.push(Number(symbol));
            } else if (context.has(symbol)) {
                solutionStack.push(context.get(symbol));
            } else {
                return {
                    error: `Variável ${symbol} não tem valor definido.`
                }
            }

            continue;
        }

        // Carrega os argumentos da operação
        const operationArgs: number[] = [];
        for (let j = 0; j < symbol.args; j++) {
            if (solutionStack.empty()) {
                return {
                    error: 'Não existem valores o suficiente para a operação ' + symbol.token
                }
            }

            operationArgs.push(solutionStack.pop() as number);
        }

        solutionStack.push(symbol.handle(...operationArgs));
    }

    if (solutionStack.length() > 1) {
        return {
            error: 'Expressão invalida. Dados não foram processados.'
        }
    }

    return { solution: solutionStack.pop() }
}

const context = new Map<string, number>([
    ['A', 0],
    ['B', 1],
    ['C', 1],
    ['D', 0]
])

const { expression, error } = inversePolishNotation(
    cleanUpExpression("'A"), // Espera 
    operatorsMap
)

if (error) {
    console.error(error);
} else {
    console.log(solver(expression, context));
}
