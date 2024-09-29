"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Solver = void 0;
const operators_1 = require("./core/operators");
const stack_1 = require("./helpers/stack");
class SolverResult {
    constructor(solution, error = false) {
        this.solution = solution;
        this.error = error;
    }
    static error(reason) {
        return new SolverResult(0, reason);
    }
}
class Solver {
    constructor(input) {
        this.input = input;
        this.context = new Map();
    }
    setContext(newContext) {
        this.context = newContext;
    }
    getContext() {
        return this.context;
    }
    getVarValue(name) {
        return this.getContext().get(name);
    }
    setVarValue(name, value) {
        return this.getContext().set(name, value);
    }
    solve() {
        const solutionStack = new stack_1.Stack();
        const input = this.input;
        console.debug(">> Resolvendo: ", input);
        console.debug(">> Contexto: ", this.getContext());
        /*
        * Expressões vazias são interpretadas como se nenhum sinal
        * estivesse conectado, resultando em uma saída com sinal baixo.
        */
        if (input.length === 0) {
            console.warn('>> Solver: Entrada vazia recebida.');
            return new SolverResult(0);
        }
        for (let i = 0; i < input.length; i++) {
            const token = input[i];
            // Se passar é um operando.
            switch (token.type) {
                case 'bit':
                    solutionStack.push(token.value);
                    break;
                case 'var':
                    const varName = token.value;
                    const value = this.getVarValue(varName);
                    if (value === undefined) {
                        return SolverResult.error(`Variável ${varName} não possui valor definido.`);
                    }
                    solutionStack.push(value);
                    break;
                case 'operator':
                    /* Preparando argumentos para operação */
                    const operationArgs = [];
                    const operator = operators_1.OPERATORS_MAP.get(token.value);
                    for (let j = 0; j < operator.args; j++) {
                        if (solutionStack.empty()) {
                            return SolverResult.error(`Operador ${operator.token} esperava receber ${operator.args} argumentos. Recebeu ${j}.`);
                        }
                        operationArgs.push(solutionStack.pop());
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
        const result = new SolverResult(solutionStack.pop());
        console.debug(">> Solver out: ", result);
        return result;
    }
}
exports.Solver = Solver;
