import { CompileError } from "../errors/compile-error";
import { operatorExists, OPERATORS } from "./operators";
import { Token } from "./token";


enum TokenizerState {
    NewToken,
    Bit,
    ParentesisOpen,
    ParentesisClose,
    Operator,
    Var,
    TokenComplete
}

export class TokenizerResult {
    constructor(
        public tokens: Token[] = [],
        public error: CompileError|false = false
    ) {}

    static error(err: CompileError) {
        return new TokenizerResult([], err);
    }
}

/** 
 * Tokenizer para as expressões booleanas. É capaz de tokenizar
 * apenas uma expressão. Para processar mais de uma expressão,
 * é necessário criar outras instâncias desta classe.
 */
/*
* A implementação foi baseada em uma máquina de estados finita.
* A cada vez que começa a ler um token, tenta adivinhar o que
* pode ser e assume um novo estado para criar um token.
* 
* Uma descrição mais detalhada pode ser encontrado na implementação
* do `parse()`.
* 
* @see {link https://www.youtube.com/watch?v=wrj3iuRdA-M}
*/
export class Tokenizer {
    /**
    * Caracteres que são ignorados na expressão. 
    * 
    * @todo Usar um RegExp no lugar de um Set.
    */
    /* 
    * Por algum motivo eu usei um Set em vez de um regex 
    * ou uma string. Sei la eu sou burro.
    */
    readonly ignoredChars = new Set([
        ' ',
        '\n',
        '\r',
        '\v',
        '\f',
    ]);

    /**
     * Carateceres reservados para operadores. Use para
     * saber quando começa e quanto termina um operador. 
     */
    /* 
    * É formatado em uma string para que as checagens sejam
    * mais rápidas.
    */
    readonly operatorsChars = OPERATORS.reduce(
        (acc, { token }) => acc + token, ''
    );

    /**
     * Caracteres permitidos como nome de variáveis. Pode
     * ser usado para saber quando uma variável começa e 
     * termina. 
     */
    // eslint-disable-next-line no-useless-escape 
    readonly varAllowedChars = /[a-zA-Z0-9_\[\]$]/;

    /*
    * Embora não seja realmente necessário usar duas variáveis para
    * controlar o estado, é recomendado que seja dessa forma para
    * evitar bugs e tornar a ideia de um processamento ao longo do
    * tempo mais explicito.
    */
    state = TokenizerState.NewToken;
    nextState = TokenizerState.NewToken;

    cursor = 0;

    char = '';
    nextChar = '';
    tokenValue = '';
    currentToken = Token.unknown();

    parentesisBalance = 0;

    output: Token[] = [];

    constructor(
        public input: string
    ) { }

    setState(state: TokenizerState) {
        this.state = state;
    }

    setNextState(state: TokenizerState) {
        this.nextState = state;
    }

    isComplete() {
        /* 
        * Quando alguns tipos especificos de token estão sendo processados,
        * é necessário mover o cursor. Então para evitar que o loop seja
        * encerrado antes da hora, também verifica se o próximo estado será
        * o de reset.
        */
        return (this.cursor >= this.input.length) && (this.nextState === TokenizerState.NewToken);
    }

    addToOutput(token: Token) {
        this.output.push(token);
    }

    /**
     * Processa a expressão recebida em uma lista de tokens.
     */
    parse(): TokenizerResult {
        if (!this.input) {
            return this._error('Não é possível processar um input vazio.')
        }

        while (!this.isComplete()) {
            this.char = this.input.charAt(this.cursor);
            this.nextChar = this.input.charAt(this.cursor + 1);

            switch (this.state) {
                /* 
                * Estado de reset. Quando lê um caractere, verifica o que
                * pode ser e assume um estado para processar o novo token. 
                */
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
                    neste estado, mas ao continuar procurando por um operador maior,
                    pode ser que seja falso. */
                    if (this.operatorsChars.includes(this.char)) {
                        /* No caso de termos um operador maior, vamos acumulando. */
                        if (this.nextChar && operatorExists(this.tokenValue + this.char)) {
                            this.tokenValue += this.char;
                            ++this.cursor;
                        } else {
                            if (operatorExists(this.tokenValue)) {
                                this.currentToken = new Token('operator', this.tokenValue);
                                this.setNextState(TokenizerState.TokenComplete);
                            } else {
                                this.tokenValue += this.char;
                                ++this.cursor;
                            }
                        }
                    } else {
                        /* 
                        * Neste ponto, encontramos um caractere que não forma um operador. 
                        * Se já temos algum valor, então ele será considerado o operador,
                        * se não, então temos um token inválido.
                        */
                        if (!operatorExists(this.tokenValue)) {
                            this._error(`Operador ${this.tokenValue} não é valido.`);
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
                        this._error('Encontrado ) sem um ( correspondente.');
                    }

                    this.tokenValue += this.char;
                    ++this.cursor;
                    this.parentesisBalance--;
                    this.currentToken = Token.parentesisClose();
                    this.setNextState(TokenizerState.TokenComplete);
                    break;

                case TokenizerState.Var:
                    /* 
                    * Similar ao processo usado na captura de operadores, vai acumulando
                    * novos caractéres enquanto eles forem válidos.
                    * 
                    * No momento em que  terminar de encontrar carateres válidos, verifica 
                    * se algum valor já foi acumulado. Se não for o caso, então temos 
                    * um nome inválido de variável. 
                    * 
                    * Este erro só acontece porque este estado é assumido como fallback, 
                    * então é necessário fazer as validações aqui dentro. 
                    */
                    if (this.varAllowedChars.test(this.char)) {
                        this.tokenValue += this.char;
                        ++this.cursor;
                    } else if (this.tokenValue) {
                        this.currentToken = new Token('var', this.tokenValue);
                        this.setNextState(TokenizerState.TokenComplete);
                    } else {
                        this._error(`Variável não pode conter o caratére ${this.char}.`);
                    }

                    break;

                case TokenizerState.TokenComplete:
                    this.addToOutput(this.currentToken);
                    this.setNextState(TokenizerState.NewToken);
                    break;
            }

            /* Decomente para um log mais detalhado. Pode parecer confuso, mas ajuda. */
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
            return this._error('Existem ( não fechados.');
        }

        const output = this.output;

        console.debug(">> Tokenizer out: ", output, '\n');

        return new TokenizerResult(output);
    }

    private _error(message: string) {
        return TokenizerResult.error(new CompileError(message))
    }
}

