import { CompileError } from "../errors/compile-error";
import { Stack } from "../helpers/stack";
import { getAssertedOperatorByToken } from "./operators";
import { Token } from "./token";
import { Tokenizer } from "./tokenizer";


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
        public tokens: Token[],

        /**
         * Nome das variáveis de entrada. Pode ser usado para 
         * configurar o contexto do Solver.
         * 
         * @see Solver 
         */
        public inputs: string[] = [],

        /**
         * Nome das saídas.
         * 
         * @todo No momento, não é possível declarar as saídas na
         * expressão. 
         */
        public outputs: string[] = [],

        public error: CompileError | false = false
    ) {}

    /**
     * Retorna uma instância desta classe configurada para
     * erro.
     */
    static error(err: CompileError) {
        return new CompilationResult([], [], [], err);
    }
}

/* 
* A classe foi feita para ser usada apenas dentro do compilador.
* Para que isto fique mais evidente, é exportada apenas como tipo
* para o caso de ser necessário.
*/
export type { CompilationResult };

/**
 * Compilador de expressões booleanas. Uma mesma instância
 * pode ser usada para processar múltiplas expressões.
 */
export class Compiler {
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
    parse(input: string): CompilationResult {
        const tokeziner = new Tokenizer(input);
        const output: Token[] = [];
        const operatorsStack = new Stack<Token>();

        console.debug(">> Compiler in: ", input, '\n');

        const tokens = tokeziner.parse();
        const variables = new Set<string>();
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            /* Descomente abaixo para um log mais detalhado. */
            /* console.debug(">> Token: ", token);
            console.debug(">> Stack: ", operatorsStack);
            console.debug(">> Out: ", output);
            console.debug(); */

            if (token.type === 'bit' || token.type === 'var') {
                if (token.type === 'var') {
                    variables.add(token.value as string);
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
                const operator = operatorsStack.pop();
                while (
                    operator &&
                    operator.type !== 'parentesisOpen'
                ) {
                    output.push();
                }   

                /* Descarta o abre-parenteses. */
                operatorsStack.pop();
                continue;
            }

            /* 
            * Procura onde encaixar o novo operador.
            */
            while (!operatorsStack.empty()) {
                const topOperator = getAssertedOperatorByToken(operatorsStack.top().value as string);
                const newOperator = getAssertedOperatorByToken(token.value as string);

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
            /* @ts-expect-error Nunca vai ser undefined */
            output.push(operatorsStack.pop());
        }

        /*
         * No momento, é processada apenas uma única expressão por
         * vez. Por isto, uma única saída é declarada com um nome
         * fixo.
         */
        const result = new CompilationResult(output, Array.from(variables.values()), [ 'S' ]);

        console.debug('>> Compiler out: ', result);
        console.debug();

        return result;
    }
}
