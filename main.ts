import { Compiler, CompilationResult } from "./compiler";
import { CompileError } from "./errors/compile-error";
import { Solver } from "./solver";


const compiler = new Compiler();

console.time('Compiler');
const parsed = compiler.parse('(A + B) . C . ~F . ((A == B) + (A ^ C))');
console.timeEnd('Compiler');


const solver = new Solver(parsed.tokens);

solver.setContext(new Map([
    ['A', 0],
    ['B', 0],
    ['C', 0],
    ['F', 0],
]))

console.time('Solver');
solver.solve();
console.timeEnd('Solver');
