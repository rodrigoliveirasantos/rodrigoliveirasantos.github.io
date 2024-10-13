import { CompilationResult } from "./compiler";
import { getAssertedOperatorByToken, Operator } from "./operators";
import { Stack } from "../helpers/stack";

/*
* Representa o resultado do Solver.
*/
class SolverResult {
    constructor (
        public solution: number,
        public error: string|false = false,
    ) {}

    static error(reason: string) {
        return new SolverResult(0, reason);
    }
}

/* SolverResult não deve ser instanciado fora do Solver. */
export type { SolverResult };

/**
 * Solucionador de expressões booleanas. Deve ser usado em
 * conjunto com o `Compiler`.
 * 
 * Soluciona apenas uma única expressão, mas gera 
 * diferentes resultados de acordo com o contexto. Para
 * processar uma nova expressão, é necessário usar uma 
 * outra instância de Solver.
 * 
 * @see {Compiler}
 */
export class Solver {

    /**
     * Define os valores das variáveis para a expressão.
     * Pode ser modificado para produzir um novo resultado.
     */
    /* 
    * Foi criado como privado para ser controlado por getters
    * e setters para permitir trocar a implementação futuramente
    * caso seja necessário. 
    */
    private context: Map<string, number> = new Map();

    constructor(
        /**
         * A expressão já processada em Tokens usando a notação
         * polonesa inversa.
         */
        public input: CompilationResult['tokens']
    ) {}

    setContext(newContext: Map<string, number>) {
        this.context = newContext;
    }

    getContext() {
        return this.context;
    }

    /**
     * Acessa o valor de uma variável no contexto. 
     */
    getVarValue(name: string): number | undefined {
        return this.getContext().get(name);
    }

    /**
     * Cria ou edita o valor de uma variável no contexto. 
     */
    setVarValue(name: string, value: number) {
        return this.getContext().set(name, value);
    }

    /**
     * Resolve a expressão recebida pelo construtor.
     * Expressões vazias têm 0 como solução.
     */
    /* 
    * Para funcionar assume que: 
    * - Todos os tokens serão usados no cálculo. Isto é, operadores que 
    * não são: bit, var e operadores já foram removidos da expressão.
    * Receber um token diferente pode resultar em erros;
    * - A entrada está usando a notação polonesa inversa.
    */
    solve(): SolverResult {
        /* 
        * Funciona como um acumulador de resultado. Quando chega no
        * final, deve possuir apenas um único valor, que é a solução.
        */
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

            switch (token.type) {
                case 'bit':
                    solutionStack.push(token.value as number);
                    break;

                case 'var': {
                    const varName = token.value as string;
                    const value = this.getVarValue(varName);

                    if (value === undefined) {
                        return SolverResult.error(`Variável ${varName} não possui valor definido.`);
                    }

                    solutionStack.push(value);
                    break;
                }
                case 'operator': {
                  /* Preparando argumentos para operação */
                  const operationArgs: number[] = [];
                  const operator =  getAssertedOperatorByToken(token.value as string);
                  
                  for (let j = 0; j < operator.args; j++) {
                      if (solutionStack.empty()) {
                          return SolverResult.error(`Operador ${operator.token} esperava receber ${operator.args} argumentos. Recebeu ${j}.`);
                      }

                      operationArgs.push(solutionStack.pop() as number);
                  }

                  solutionStack.push(operator.handle(...operationArgs));
                  break;
                }
                    
                default:
                    return SolverResult.error(`Recebido token ${token.value} inesperado.`);
            }
        }

        /* 
        * Se o soluctionStack possuir mais do que um elemento,
        * significa que algum operando não foi consumido ou faltam
        * operadores para chegar a solução. Isto só deve acontecer
        * se a expressão tiver algum problema que não pode ser 
        * identificado durante o processo de compilação.
        */
        if (solutionStack.length() > 1) {
            return SolverResult.error('Expressão invalida. Dados não foram processados.');
        }

        const result = new SolverResult(solutionStack.pop() as number);

        console.debug(">> Solver out: ", result);

        return result
    }
}
