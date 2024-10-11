"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const operators_1 = require("./core/operators");
const stack_1 = require("./helpers/stack");
const tokenizer_1 = require("./tokenizer");
/**
 * Representa o resultado da compilação de uma expressão.
 */
class CompilationResult {
    constructor(
    /**
     * Expressão compilada em uma lista de Tokens.
     */
    /*
    * Emitir o resultado em Tokens, permite que os consumidores
    * consigam separar mais facilmente o que é bit, o que é variável
    * e o que é operador.
    */
    tokens, 
    /**
     * Nome das variáveis de entrada. Pode ser usado para
     * configurar o contexto do Solver.
     *
     * @see Solver
     */
    inputs = [], 
    /**
     * Nome das saídas.
     *
     * @todo No momento, não é possível declarar as saídas na
     * expressão.
     */
    outputs = [], error = false) {
        this.tokens = tokens;
        this.inputs = inputs;
        this.outputs = outputs;
        this.error = error;
    }
    /**
     * Retorna uma instância desta classe configurada para
     * erro.
     */
    static error(err) {
        return new CompilationResult([], [], [], err);
    }
}
/**
 * Compilador de expressões booleanas. Uma mesma instância
 * pode ser usada para processar múltiplas expressões.
 */
class Compiler {
    /*
    * Implementa o algorítmo Shunting Yard para gerar a expressão
    * em RPN. Não é muito complexo, mas da conta de expressões
    * lógicas de maneira bem leve.
    *
    * Para funcionar assume que:
    * 1. O input não é vazio;
    * 2. Todos os Tokens do tipo "operator" correspondem a um operador válido;
    * 3. Balanceamento de parêntesis já foi tratado pelo Tokenizer.
    *
    * Inspirado por https://www.youtube.com/watch?v=unh6aK8WMwM.
    */
    /**
     * Processa uma expressão booleana, emitindo como resultado
     * uma outra expressão em notação polonesa reversa,
     * que pode ser resolvida pelo `Solver`.
     *
     * @see {Solver}
     */
    parse(input) {
        const tokeziner = new tokenizer_1.Tokenizer(input);
        const output = [];
        const operatorsStack = new stack_1.Stack();
        console.debug(">> Compiler in: ", input, '\n');
        const tokens = tokeziner.parse();
        const variables = new Set();
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            /* Descomente abaixo para um log mais detalhado. */
            /* console.debug(">> Token: ", token);
            console.debug(">> Stack: ", operatorsStack);
            console.debug(">> Out: ", output);
            console.debug(); */
            if (token.type === 'bit' || token.type === 'var') {
                if (token.type === 'var') {
                    variables.add(token.value);
                }
                output.push(token);
                continue;
            }
            /*
            * Quando um fecha-parêntesis é encontrado, todos os operadores
            * são jogados na pilha até que um abre-parêntesis é encontrado.
            * Os parêntesis são descartados porque não são necessários para
            * resolver a expressão.
            */
            if (token.type === 'parentesisClose') {
                while (!operatorsStack.empty() &&
                    operatorsStack.top().type !== 'parentesisOpen') {
                    output.push(operatorsStack.pop());
                }
                /* Descarta o abre-parenteses. */
                operatorsStack.pop();
                continue;
            }
            /*
            * Procura onde encaixar o novo operador.
            */
            while (!operatorsStack.empty()) {
                const topOperator = operators_1.OPERATORS_MAP.get(operatorsStack.top().value);
                const newOperator = operators_1.OPERATORS_MAP.get(token.value);
                /*
                * Os operadores na pilha com precedência maior do que o novo operador
                * já serão movidos para o output para serem calculados antes.
                *
                * Embora sejam considerados operadores, o abre-parêntesis não tem a
                * precendência levada em consideração, já que não será usado no resultado
                * final. Além disso, nenhum fecha-parêntesis é adicionado à pilha e, portanto,
                * não é necessário tratar.
                *
                * Operadores unários iguais também não tem a precedência levada em consideração
                * para permitir encadeamento.
                */
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
        const result = new CompilationResult(output, Array.from(variables.values()), ['S']);
        console.debug('>> Compiler out: ', result);
        console.debug();
        return result;
    }
}
exports.Compiler = Compiler;
