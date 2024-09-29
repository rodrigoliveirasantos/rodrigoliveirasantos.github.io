
export type TokenTypes =
    'operator'|
    'bit'|
    'var'|
    'parentesisOpen'|
    'parentesisClose'|
    'unknown';

export class Token {
    constructor(
        public type: TokenTypes,
        public value: string|number
    ) {}

    static unknown() {
        return new Token('unknown', '');
    }

    static parentesisOpen() {
        return new Token('parentesisOpen', '(');
    }

    static parentesisClose() {
        return new Token('parentesisClose', ')');
    }

    setType(type: typeof this.type) {
        this.type = type;
    }

    setValue(value: typeof this.value) {
        this.value = value;
    }
}