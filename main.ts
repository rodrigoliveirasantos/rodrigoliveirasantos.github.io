import { CompilationResult, Compiler } from "./compiler";


function cleanUpExpression(exp: string) {
    return exp.trim().replace(/[\u0020\n]+/g, '');
}


function solver(input: CompilationResult['outputs']), context: Map<string, number>) {
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
    cleanUpExpression("~~~A"), // Espera 
    operatorsMap
)

if (error) {
    console.error(error);
} else {
    console.log(solver(expression, context));
}

