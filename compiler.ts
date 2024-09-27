import { CompileError } from "./errors/compile-error";
import { Stack } from "./helpers/stack";



type OperatorsMap = Map<string, Operator>;

type TokenValue = {
    operator: Operator,
    bit: number,
    var: string,
    unknown: string
}

enum TokenizerState {
    NewToken,
    Bit,
    ParentesisOpen,
    ParentesisClose,
    Operator,
    TokenComplete
}

function makeOperatorsMap(operators: Operator[]): OperatorsMap {
    return new Map(operators.map((operator) => [operator.token, operator]))
}

class Operator {
    constructor(
        public token: string,
        public precedence: number,
        public args: number,
        public handle: (...args: number[]) => number 
    ) {}
}

/**
 * Operadores válidos. Eles são ordenados pelo tamanho do token
 * decrescente.
 */
const OPERATORS = [
    new Operator('(', -1, 0, () => 0),
    new Operator(')', -1, 0, () => 0),
    new Operator('+', 1, 2, (a, b) => a | b),
    new Operator('^', 2, 2, (a, b) => a ^ b),
    new Operator('.', 3, 2, (a, b) => a & b),
    new Operator("~", 4, 1, (a)    => a ? 0 : 1),
].sort((a, b) => {
    return b.token.length - a.token.length;
});

const OPERATORS_MAP: OperatorsMap = makeOperatorsMap(OPERATORS);

class Token {
    constructor(
        public type: keyof TokenValue,
        public value: TokenValue[keyof TokenValue]
    ) {}

    setType(type: typeof this.type) {
        this.type = type;
    }

    setValue(value: typeof this.value) {
        this.value = value;
    }
}

class Tokenizer {
    readonly ignoredChars = new Set([
        ' ',
        '\n',
        '\r',
        '\v',
        '\f',
    ]);

    readonly operatorsChars = OPERATORS.reduce(
        (acc, { token }) => acc + token, ''
    );

    state: TokenizerState;
    nextState: TokenizerState;
    cursor = 0;
    char: string = '';
    nextChar: string = '';
    tokenValue: string = '';
    currentToken = new Token('unknown', '');
    output: Token[] = [];

    constructor(
        public input: string
    ) {
        this.state = TokenizerState.NewToken;
        this.nextState = TokenizerState.NewToken;
    }

    setState(state: TokenizerState) {
        this.state = state;
    }

    setNextState(state: TokenizerState) {
        this.nextState = state;
    }

    ended() {
        return this.cursor >= this.input.length;
    }

    addToOutput(token: Token) {
        this.output.push(token);
    }

    parse(): Token[] | CompileError {
        if (!this.input) {
            return new CompileError('Não é possível processar um input vazio.')
        }

        while (!this.ended()) {
            this.char = this.input.charAt(this.cursor);
            this.nextChar = this.input.charAt(this.cursor + 1);

            switch(this.state) {
                case TokenizerState.NewToken:
                    /*  
                    * Chars inuteis são simplesmente consumidos sem
                    * ser adicionados ao output
                    */
                    if (this.ignoredChars.has(this.char)) {
                        this.setNextState(TokenizerState.NewToken);
                        ++this.cursor;
                    }

                    // Checa se é um bit
                    else if (this.char === '0' || this.char === '1') {
                        this.tokenValue = this.char;
                        this.setState(TokenizerState.Bit);
                        ++this.cursor;
                    }

                    // Note que aqui o cursor não é movido.
                    else if (this.operatorsChars.includes(this.char)) {
                        this.setNextState(TokenizerState.Operator);
                    }

                    break;
                

                case TokenizerState.Bit:
                    this.setNextState(TokenizerState.TokenComplete);
                    this.currentToken = new Token('bit', Number(this.tokenValue));
                    break;

                case TokenizerState.Operator:
                    if (this.operatorsChars.includes(this.char)) {
                        // Verifica se, com o proximo char, pode ser um operador maior.
                        // Isto permite que existam operadores de mais de um digito.
                        if (this.nextCharFormsAOperator()) {
                            this.tokenValue += this.nextChar;
                            ++this.cursor;
                        } else {
                            if (OPERATORS_MAP.has(this.tokenValue)) {
                                this.setNextState(TokenizerState.TokenComplete);
                                this.currentToken = new Token('operator', this.tokenValue);
                            } else {
                                return Token
                            }

                            
                        }
                    } else {

                    }
                    
                    
                    break;

            }

            this.setState(this.nextState);
        }
    }

    nextCharFormsAOperator() {
        return OPERATORS.find((operator) => {
            return operator.token === this.tokenValue + this.nextChar
        })
    }
}

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
        const output: (string|Operator)[] = [];
        const operatorsStack = new Stack<Operator>();

        console.debug(">> Input: ", input)

        if (!input) {
            return new CompilationResult([]);
        }
        
        for (let i = 0; i < input.length; i++) {
            const token = input.charAt(i);
            const newOperator = this.operatorsMap.get(token);
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
                    (newOperator.args === 1 && newOperator.token === topOperator.token) ||
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
}