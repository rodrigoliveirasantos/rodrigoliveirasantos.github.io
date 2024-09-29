"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static unknown() {
        return new Token('unknown', '');
    }
    static parentesisOpen() {
        return new Token('parentesisOpen', '(');
    }
    static parentesisClose() {
        return new Token('parentesisClose', ')');
    }
    setType(type) {
        this.type = type;
    }
    setValue(value) {
        this.value = value;
    }
}
exports.Token = Token;
