import { OPERATORS, OPERATORS_MAP } from "./core/operators";
import { Token } from "./core/token";
import { CompileError } from "./errors/compile-error";

enum TokenizerState {
    NewToken,
    Bit,
    ParentesisOpen,
    ParentesisClose,
    Operator,
    Var,
    TokenComplete
}

 export class Tokenizer {
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

    readonly varAllowedChars = /[a-zA-Z0-9_\[\]$]/;

    state = TokenizerState.NewToken;
    nextState = TokenizerState.NewToken;

    cursor = 0;

    char: string = '';
    nextChar: string = '';
    
    tokenValue: string = '';
    currentToken = Token.unknown();

    parentesisBalance = 0;

    output: Token[] = [];

    constructor(
        public input: string
    ) {}
    
    setState(state: TokenizerState) {
        this.state = state;
    }

    setNextState(state: TokenizerState) {
        this.nextState = state;
    }

    isComplete() {
        return (this.cursor >= this.input.length) && (this.nextState === TokenizerState.NewToken);
    }

    addToOutput(token: Token) {
        this.output.push(token);
    }
    
    /**
     * @throws {CompileError} Se a expressão for inválida.
     */
    parse(): Token[] {
        if (!this.input) {
            throw new CompileError('Não é possível processar um input vazio.')
        }
        
        while (!this.isComplete()) {
            this.char = this.input.charAt(this.cursor);
            this.nextChar = this.input.charAt(this.cursor + 1);

            switch(this.state) {
                case TokenizerState.NewToken:
                    this.tokenValue = '';
                    this.currentToken = Token.unknown();

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
                        this.setNextState(TokenizerState.Bit);
                        ++this.cursor;
                    }

                    else if (this.char === '(') {
                        this.setNextState(TokenizerState.ParentesisOpen);
                    }

                    else if (this.char === ')') {
                        this.setNextState(TokenizerState.ParentesisClose);
                    }

                    /* Checa se é um operador */
                    else if (this.operatorsChars.includes(this.char)) {
                        this.setNextState(TokenizerState.Operator);
                    }

                    else {
                        this.setNextState(TokenizerState.Var);
                    }

                    break;
                
                case TokenizerState.Bit:
                    this.setNextState(TokenizerState.TokenComplete);
                    this.currentToken = new Token('bit', Number(this.tokenValue));
                    break;

                case TokenizerState.Operator:
                    /* Isto sempre vai ser verdadeiro na primeira vez que entrar
                    neste estado, mas continuar procurando por um operador maior,
                    pode ser que seja falso. */
                    if (this.operatorsChars.includes(this.char)) {
                        /* No caso de termos um operador maior, vamos acumulando. */
                        if (OPERATORS_MAP.has(this.tokenValue + this.char)) {
                            this.tokenValue += this.char;
                            ++this.cursor;
                        } else {
                            if (OPERATORS_MAP.has(this.tokenValue)) {
                                this.currentToken = new Token('operator', this.tokenValue);
                                this.setNextState(TokenizerState.TokenComplete);
                            } else {
                                this.tokenValue += this.char;
                                ++this.cursor;
                            }
                        }
                    } else {
                        if (!OPERATORS_MAP.has(this.tokenValue)) {
                            throw new CompileError(`Operador ${this.tokenValue} não é valido.`);
                        }

                        this.currentToken = new Token('operator', this.tokenValue);
                        this.setNextState(TokenizerState.TokenComplete);
                    }

                    break;     
                    
                case TokenizerState.ParentesisOpen:
                    this.tokenValue += this.char;
                    ++this.cursor;
                    this.parentesisBalance++;
                    this.currentToken = Token.parentesisOpen();
                    this.setNextState(TokenizerState.TokenComplete);
                    break;

                case TokenizerState.ParentesisClose:
                    if (this.parentesisBalance === 0) {
                        throw new CompileError('Encontrado ) sem um ( correspondênte.');
                    }

                    this.tokenValue += this.char;
                    ++this.cursor;
                    this.parentesisBalance--;
                    this.currentToken = Token.parentesisClose();
                    this.setNextState(TokenizerState.TokenComplete);
                    break;
                
                case TokenizerState.Var:
                    if (this.varAllowedChars.test(this.char)) {
                        this.tokenValue += this.char;  
                        ++this.cursor;
                    } else if (this.tokenValue) {
                        this.currentToken = new Token('var', this.tokenValue);
                        this.setNextState(TokenizerState.TokenComplete);
                    } else {
                        throw new CompileError(`Variável não pode conter o caratére ${this.char}.`);
                    }

                    break;

                case TokenizerState.TokenComplete:
                    this.addToOutput(this.currentToken);
                    this.setNextState(TokenizerState.NewToken);
                    break;
            }

            /* console.log({
                char: this.char,
                nextChar: this.nextChar,
                tokenValue: this.tokenValue,
                state: this.state,
                nextState: this.nextState,
                cursor: this.cursor + '/' + this.input.length
            }) */

            this.setState(this.nextState);
        }

        if (this.parentesisBalance > 0) {
            throw new CompileError('Existem ( não fechados.');
        } 

        const output = this.output;

        console.debug(">> Tokenizer out: ", output, '\n');

        return output;
    }
}

