export class Stack<T> {
    private items: T[];

    constructor(items: ArrayLike<T> = []) {
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

    push(item: T) {
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