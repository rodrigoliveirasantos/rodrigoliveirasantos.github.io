"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truthTable = truthTable;
exports.sumOfProducts = sumOfProducts;
const compiler_1 = require("./compiler");
const operators_1 = require("./core/operators");
const solver_1 = require("./solver");
function validateTruthTable(table) {
    const [head, ...rows] = table;
    const isNotEmpty = table.length > 0;
    const correctRowsCount = rows.length === Math.pow(2, head.length - 1);
    const isValid = isNotEmpty && correctRowsCount;
    let reason = '';
    if (!isValid) {
        if (!isNotEmpty) {
            reason = 'A tabela-verdade não pode estar vazia';
        }
        else if (!correctRowsCount) {
            reason = 'A tabela-verdade não possui todas as combinações de entrada';
        }
    }
    return { isValid, reason };
}
function truthTable(expression) {
    const compiler = new compiler_1.Compiler();
    const { tokens, inputs, outputs, error } = compiler.parse(expression);
    const solver = new solver_1.Solver(tokens);
    const inputColsCount = inputs.length;
    const rowsCount = Math.pow(2, inputs.length);
    const table = [[...inputs, ...outputs]];
    /* No momento vamos so jogar o erro. */
    if (error) {
        return { error };
    }
    for (let i = 0; i < rowsCount; i++) {
        const row = [];
        const rowBinValue = i.toString(2).padStart(inputColsCount, '0');
        inputs.forEach((input, j) => {
            const bit = Number(rowBinValue.charAt(j));
            row.push(bit);
            solver.setVarValue(input, bit);
        });
        const { solution, error } = solver.solve();
        if (error) {
            return { error };
        }
        outputs.forEach(() => {
            row.push(solution);
        });
        table.push(row);
    }
    return { table };
}
function sumOfProducts(truthTable, { includeOutput = false, } = {}) {
    const [head, ...rows] = truthTable;
    const inputs = head.slice(0, -1);
    const outputIndex = head.length - 1;
    let expression = '';
    const { isValid, reason } = validateTruthTable(truthTable);
    if (!isValid) {
        return { error: reason };
    }
    if (inputs.length === 0) {
        return { expression };
    }
    if (includeOutput) {
        expression += `${head[outputIndex]}(${inputs.join(', ')}) = `;
    }
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        /* Linhas onde a saída é 0 devem ser ignoradas */
        if (!row[outputIndex]) {
            continue;
        }
        /* Monta um produto na forma A.B.C.D... */
        const product = row.slice(0, -1).reduce((acc, value, j) => {
            return (acc +
                (j > 0 ? operators_1.AND.token : '') +
                (value === 1 ? inputs[j] : operators_1.NOT.token + inputs[j]));
        }, '');
        if (i > 0) {
            expression += ' ' + operators_1.OR.token + ' ';
        }
        expression += product;
    }
    return { expression };
}
