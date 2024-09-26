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
    new Operator('+', 1, 2, (a, b) => a | b),
    new Operator('.', 2, 2, (a, b) => a & b),
    new Operator('^', 3, 2, (a, b) => a ^ b),
    new Operator("'", 4, 1, (a) => a ? 0 : 1),
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

    console.log(">> Input: " + input)

    if (!input) {
        return [];
    }
    
    for (let i = 0; i < input.length; i++) {
        const token = input.charAt(i);
        const newOperator = operators[token];
        const isOperator = !!newOperator 

        console.log(">> Token: " + token);
        console.log(">> Stack: " + operatorsStack.toString());
        console.log(">> Out: " + JSON.stringify(output));
        console.log();

        // Qualquer não operador será considerado uma entrada ou valor fixo.
        if (!isOperator) {
            output.push(token);
            continue;
        }

        while (!operatorsStack.empty()) {
            const topOperator = operatorsStack.top();

            // Achou o lugar certo do operador
            if (topOperator.precedence < newOperator.precedence) {
                break;
            }

            // Move o operador que estava no topo para o output
            output.push(topOperator);
            operatorsStack.pop();
        }

        operatorsStack.push(newOperator);
    }

    while (!operatorsStack.empty()) {
        output.push(operatorsStack.pop()!);
    }

    return output
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
    ['C', 0]
])

console.log(
    solver(
        inversePolishNotation(
            cleanUpExpression("'A +"), // Espera 
            operatorsMap
        ),
        context
    )
   
);