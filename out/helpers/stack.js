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
