"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = exports.CompilationResult = void 0;
const operators_1 = require("./core/operators");
const stack_1 = require("./helpers/stack");
const tokenizer_1 = require("./tokenizer");
class CompilationResult {
    constructor(tokens, inputs = [], outputs = [], error = false) {
        this.tokens = tokens;
        this.inputs = inputs;
        this.outputs = outputs;
        this.error = error;
    }
    static error(err) {
        return new CompilationResult([], [], [], err);
    }
}
exports.CompilationResult = CompilationResult;
class Compiler {
    parse(input) {
        const tokeziner = new tokenizer_1.Tokenizer(input);
        const output = [];
        const operatorsStack = new stack_1.Stack();
        console.debug(">> Compiler in: ", input, '\n');
        const tokens = tokeziner.parse();
        const variables = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            /* console.debug(">> Token: ", token);
            console.debug(">> Stack: ", operatorsStack);
            console.debug(">> Out: ", output);
            console.debug(); */
            // Qualquer não operador será considerado uma entrada ou valor fixo.
            if (token.type === 'bit' || token.type === 'var') {
                if (token.type === 'var') {
                    variables.push(token.value);
                }
                output.push(token);
                continue;
            }
            if (token.type === 'parentesisClose') {
                // Busca o abre parenteses.
                while (!operatorsStack.empty() &&
                    operatorsStack.top().type !== 'parentesisOpen') {
                    output.push(operatorsStack.pop());
                }
                // Descarta o abre-parenteses.
                operatorsStack.pop();
                continue;
            }
            while (!operatorsStack.empty()) {
                const topOperator = operators_1.OPERATORS_MAP.get(operatorsStack.top().value);
                const newOperator = operators_1.OPERATORS_MAP.get(token.value);
                // Se for o parenteses, ou o novo operador tem a precedencia menor
                // então ele deveria entrar no topo da pilha mesmo.
                if (token.type === 'parentesisOpen' ||
                    (newOperator.args === 1 && newOperator.token === topOperator.token) ||
                    topOperator.precedence < newOperator.precedence) {
                    break;
                }
                // Move o operador que estava no topo para o output
                output.push(operatorsStack.top());
                operatorsStack.pop();
            }
            operatorsStack.push(token);
        }
        while (!operatorsStack.empty()) {
            output.push(operatorsStack.pop());
        }
        /*
         * No momento, é processada apenas uma única expressão por
         * vez. Por isto, uma única saída é declarada com um nome
         * fixo.
         */
        const result = new CompilationResult(output, variables, ['S']);
        console.debug('>> Compiler out: ', result);
        console.debug();
        return result;
    }
}
exports.Compiler = Compiler;
