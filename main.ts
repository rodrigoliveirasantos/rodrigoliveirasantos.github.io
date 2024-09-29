import { Compiler } from "./compiler";
import { CompileError } from "./errors/compile-error";
import { Solver } from "./solver";


const compiler = new Compiler();
const parsed = compiler.parse('(((())))');

if (parsed instanceof CompileError) {
    console.error('>> Error: ', parsed.reason);
} 

const solver = new Solver(parsed.tokens);

solver.setContext(new Map([
    ['ABC', 0],
    ['B', 0],
    ['C', 0],
    ['X', 0],
    ['Z1', 0]
]))

console.log(solver.solve());