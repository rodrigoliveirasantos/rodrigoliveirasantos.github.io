"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("./compiler");
const compile_error_1 = require("./errors/compile-error");
const solver_1 = require("./solver");
const compiler = new compiler_1.Compiler();
const parsed = compiler.parse('(((())))');
if (parsed instanceof compile_error_1.CompileError) {
    console.error('>> Error: ', parsed.reason);
}
const solver = new solver_1.Solver(parsed.tokens);
solver.setContext(new Map([
    ['ABC', 0],
    ['B', 0],
    ['C', 0],
    ['X', 0],
    ['Z1', 0]
]));
console.log(solver.solve());
