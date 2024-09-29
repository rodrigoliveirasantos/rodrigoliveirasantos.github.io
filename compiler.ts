import { OPERATORS_MAP } from "./core/operators";
import { Token } from "./core/token";
import { CompileError } from "./errors/compile-error";
import { Stack } from "./helpers/stack";
import { Tokenizer } from "./tokenizer";

export class CompilationResult {
    constructor(
        public tokens: Token[],
        public inputs: string[] = [],
        public outputs: string[] = [],
        public error: CompileError | false = false
    ) {}

    static error(err: CompileError) {
        return new CompilationResult([], [], [], err);
    }
}

export class Compiler {
    parse(input: string): CompilationResult {
        const tokeziner = new Tokenizer(input);
        const output: Token[] = [];
        const operatorsStack = new Stack<Token>();

        console.debug(">> Compiler in: ", input, '\n');

        const tokens = tokeziner.parse();
        const variables: string[] = [];
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            /* console.debug(">> Token: ", token);
            console.debug(">> Stack: ", operatorsStack);
            console.debug(">> Out: ", output);
            console.debug(); */

            // Qualquer não operador será considerado uma entrada ou valor fixo.
            if (token.type === 'bit' || token.type === 'var') {
                if (token.type === 'var') {
                    variables.push(token.value as string);
                }

                output.push(token);
                continue;
            }

            if (token.type === 'parentesisClose') {
                // Busca o abre parenteses.
                while (
                    !operatorsStack.empty() &&
                    operatorsStack.top().type !== 'parentesisOpen'
                ) {
                    output.push(operatorsStack.pop());
                }   

                // Descarta o abre-parenteses.
                operatorsStack.pop();
                continue;
            }

            while (!operatorsStack.empty()) {
                const topOperator = OPERATORS_MAP.get(operatorsStack.top().value as string);
                const newOperator = OPERATORS_MAP.get(token.value as string);

                // Se for o parenteses, ou o novo operador tem a precedencia menor
                // então ele deveria entrar no topo da pilha mesmo.
                if (
                    token.type === 'parentesisOpen' ||
                    (newOperator.args === 1 && newOperator.token === topOperator.token) ||
                    topOperator.precedence < newOperator.precedence
                ) {
                    break;
                }

                // Move o operador que estava no topo para o output
                output.push(operatorsStack.top());
                operatorsStack.pop();
            }

            operatorsStack.push(token);
        }

        while (!operatorsStack.empty()) {
            output.push(operatorsStack.pop()!);
        }

        /*
         * No momento, é processada apenas uma única expressão por
         * vez. Por isto, uma única saída é declarada com um nome
         * fixo.
         */
        const result = new CompilationResult(output, variables, [ 'S' ]);

        console.debug('>> Compiler out: ', result);
        console.debug();

        return result;
    }
}