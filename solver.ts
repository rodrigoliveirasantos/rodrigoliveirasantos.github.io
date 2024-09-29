import { CompilationResult } from "./compiler";
import { Operator, OPERATORS_MAP } from "./core/operators";
import { Stack } from "./helpers/stack";

class SolverResult {
    constructor (
        public solution: number,
        public error: string|false = false,
    ) {}

    static error(reason: string) {
        return new SolverResult(0, reason);
    }
}

export class Solver {

    private context: Map<string, number> = new Map();

    constructor(
        public input: CompilationResult['tokens']
    ) {}

    setContext(newContext: Map<string, number>) {
        this.context = newContext;
    }

    getContext() {
        return this.context;
    }

    getVarValue(name: string): number | undefined {
        return this.getContext().get(name);
    }

    setVarValue(name: string, value: number) {
        return this.getContext().set(name, value);
    }

    solve(): SolverResult {
        const solutionStack = new Stack<number|Operator>();
        const input = this.input;

        console.debug(">> Resolvendo: ", input);
        console.debug(">> Contexto: ", this.getContext());

        /* 
        * Expressões vazias são interpretadas como se nenhum sinal
        * estivesse conectado, resultando em uma saída com sinal baixo.
        */
        if (input.length === 0) {
            console.warn('>> Solver: Entrada vazia recebida.')
            return new SolverResult(0);
        } 

        for (let i = 0; i < input.length; i++) {
            const token = input[i];

            // Se passar é um operando.
            switch (token.type) {
                case 'bit':
                    solutionStack.push(token.value as number);
                    break;


                case 'var':
                    const varName = token.value as string;
                    const value = this.getVarValue(varName);

                    if (value === undefined) {
                        return SolverResult.error(`Variável ${varName} não possui valor definido.`);
                    }

                    solutionStack.push(value);
                    break;
                

                case 'operator':
                    /* Preparando argumentos para operação */
                    const operationArgs: number[] = [];
                    const operator = OPERATORS_MAP.get(token.value as string);
                    for (let j = 0; j < operator.args; j++) {
                        if (solutionStack.empty()) {
                            return SolverResult.error(`Operador ${operator.token} esperava receber ${operator.args} argumentos. Recebeu ${j}.`);
                        }

                        operationArgs.push(solutionStack.pop() as number);
                    }

                    solutionStack.push(operator.handle(...operationArgs));
                    break;


                default:
                    return SolverResult.error(`Recebido token ${token.value} inesperado.`);
            }
        }

        if (solutionStack.length() > 1) {
            return SolverResult.error('Expressão invalida. Dados não foram processados.');
        }

        const result = new SolverResult(solutionStack.pop() as number);

        console.debug(">> Solver out: ", result);

        return result
    }
}
