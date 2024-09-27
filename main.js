define("errors/compile-error", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompileError = void 0;
    class CompileError extends Error {
    }
    exports.CompileError = CompileError;
});
define("helpers/stack", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Stack = void 0;
    class Stack {
        constructor(items = []) {
            this.items = [];
            for (let i = 0; i < items.length; i++) {
                this.push(items[i]);
            }
        }
        length() {
            return this.items.length;
        }
        empty() {
            return this.items.length === 0;
        }
        push(item) {
            this.items.push(item);
        }
        top() {
            if (!this.items.length) {
                return undefined;
            }
            return this.items[this.items.length - 1];
        }
        pop() {
            return this.items.pop();
        }
        toString() {
            return JSON.stringify(this.items);
        }
    }
    exports.Stack = Stack;
});
define("compiler", ["require", "exports", "errors/compile-error", "helpers/stack"], function (require, exports, compile_error_1, stack_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Compiler = exports.CompilationResult = void 0;
    var TokenizerState;
    (function (TokenizerState) {
        TokenizerState[TokenizerState["NewToken"] = 0] = "NewToken";
        TokenizerState[TokenizerState["Bit"] = 1] = "Bit";
        TokenizerState[TokenizerState["ParentesisOpen"] = 2] = "ParentesisOpen";
        TokenizerState[TokenizerState["ParentesisClose"] = 3] = "ParentesisClose";
        TokenizerState[TokenizerState["Operator"] = 4] = "Operator";
        TokenizerState[TokenizerState["TokenComplete"] = 5] = "TokenComplete";
    })(TokenizerState || (TokenizerState = {}));
    function makeOperatorsMap(operators) {
        return new Map(operators.map((operator) => [operator.token, operator]));
    }
    class Operator {
        constructor(token, precedence, args, handle) {
            this.token = token;
            this.precedence = precedence;
            this.args = args;
            this.handle = handle;
        }
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
        new Operator("~", 4, 1, (a) => a ? 0 : 1),
    ].sort((a, b) => {
        return b.token.length - a.token.length;
    });
    const OPERATORS_MAP = makeOperatorsMap(OPERATORS);
    class Token {
        constructor(type, value) {
            this.type = type;
            this.value = value;
        }
        setType(type) {
            this.type = type;
        }
        setValue(value) {
            this.value = value;
        }
    }
    class Tokenizer {
        constructor(input) {
            this.input = input;
            this.ignoredChars = new Set([
                ' ',
                '\n',
                '\r',
                '\v',
                '\f',
            ]);
            this.operatorsChars = OPERATORS.reduce((acc, { token }) => acc + token, '');
            this.cursor = 0;
            this.char = '';
            this.nextChar = '';
            this.tokenValue = '';
            this.currentToken = new Token('unknown', '');
            this.output = [];
            this.state = TokenizerState.NewToken;
            this.nextState = TokenizerState.NewToken;
        }
        setState(state) {
            this.state = state;
        }
        setNextState(state) {
            this.nextState = state;
        }
        ended() {
            return this.cursor >= this.input.length;
        }
        addToOutput(token) {
            this.output.push(token);
        }
        parse() {
            if (!this.input) {
                return new compile_error_1.CompileError('Não é possível processar um input vazio.');
            }
            while (!this.ended()) {
                this.char = this.input.charAt(this.cursor);
                this.nextChar = this.input.charAt(this.cursor + 1);
                switch (this.state) {
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
                            }
                            else {
                                if (OPERATORS_MAP.has(this.tokenValue)) {
                                    this.setNextState(TokenizerState.TokenComplete);
                                    this.currentToken = new Token('operator', this.tokenValue);
                                }
                                else {
                                    return Token;
                                }
                            }
                        }
                        else {
                        }
                        break;
                }
                this.setState(this.nextState);
            }
        }
        nextCharFormsAOperator() {
            return OPERATORS.find((operator) => {
                return operator.token === this.tokenValue + this.nextChar;
            });
        }
    }
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
            const output = [];
            const operatorsStack = new stack_1.Stack();
            console.debug(">> Input: ", input);
            if (!input) {
                return new CompilationResult([]);
            }
            for (let i = 0; i < input.length; i++) {
                const token = input.charAt(i);
                const newOperator = this.operatorsMap.get(token);
                const isOperator = !!newOperator;
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
                    while (!operatorsStack.empty() &&
                        operatorsStack.top().token !== '(') {
                        output.push(operatorsStack.pop());
                    }
                    // Se o operatorsStack está vazio, é porque o ( não foi encontrado.
                    if (operatorsStack.empty()) {
                        return { error: 'Fecha-parenteses sem um abre-parenteses correspondente.' };
                    }
                    // Descarta o abre-parenteses.
                    operatorsStack.pop();
                    continue;
                }
                while (!operatorsStack.empty()) {
                    const topOperator = operatorsStack.top();
                    // Se for o parenteses, ou o novo operador tem a precedencia menor
                    // então ele deveria entrar no topo da pilha mesmo.
                    if (newOperator.token === '(' ||
                        (newOperator.args === 1 && newOperator.token === topOperator.token) ||
                        topOperator.precedence < newOperator.precedence) {
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
                    return { error: 'Encontrado abre-parentesis sem um fecha-parentesis correspondente.' };
                }
                output.push(operatorsStack.pop());
            }
            return { expression: output };
        }
    }
    exports.Compiler = Compiler;
});
define("main", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function cleanUpExpression(exp) {
        return exp.trim().replace(/[\u0020\n]+/g, '');
    }
    context: Map;
    {
        const solutionStack = new Stack();
        console.log(">> Resolvendo: ", input);
        console.log(">> Contexto: ", context);
        for (let i = 0; i < input.length; i++) {
            const symbol = input[i];
            // Se passar é um operando.
            if (typeof symbol === 'string') {
                if (symbol === '0' || symbol === '1') {
                    solutionStack.push(Number(symbol));
                }
                else if (context.has(symbol)) {
                    solutionStack.push(context.get(symbol));
                }
                else {
                    return {
                        error: `Variável ${symbol} não tem valor definido.`
                    };
                }
                continue;
            }
            // Carrega os argumentos da operação
            const operationArgs = [];
            for (let j = 0; j < symbol.args; j++) {
                if (solutionStack.empty()) {
                    return {
                        error: 'Não existem valores o suficiente para a operação ' + symbol.token
                    };
                }
                operationArgs.push(solutionStack.pop());
            }
            solutionStack.push(symbol.handle(...operationArgs));
        }
        if (solutionStack.length() > 1) {
            return {
                error: 'Expressão invalida. Dados não foram processados.'
            };
        }
        return { solution: solutionStack.pop() };
    }
    const context = new Map([
        ['A', 0],
        ['B', 1],
        ['C', 1],
        ['D', 0]
    ]);
    const { expression, error } = inversePolishNotation(cleanUpExpression("~~~A"), // Espera 
    operatorsMap);
    if (error) {
        console.error(error);
    }
    else {
        console.log(solver(expression, context));
    }
});
