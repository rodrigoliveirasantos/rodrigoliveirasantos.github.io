import { Compiler } from "../core/compiler";
import { AND, NOT, OR } from "../core/operators";
import { Solver } from "../core/solver";

export type TruthTable = [string[], ...number[][]];

export function validateTruthTable(table: TruthTable): {
    isValid: boolean,
    reason: string
} {
    const [ head, ...rows ] = table;
    const isNotEmpty = table.length > 0;
    const correctRowsCount = rows.length === Math.pow(2, head.length - 1);
    const isValid = isNotEmpty && correctRowsCount;
    let reason = '';

    if (!isValid) {
        if (!isNotEmpty) {
            reason = 'A tabela-verdade não pode estar vazia';
        } else if (!correctRowsCount) {
            reason = 'A tabela-verdade não possui todas as combinações de entrada';
        }
    }
    
    return { isValid, reason };
}  


export function generateTruthTable(expression: string) {
    const compiler = new Compiler();
    const { tokens, inputs, outputs, error } = compiler.compile(expression);
    const solver = new Solver(tokens);
    const inputColsCount = inputs.length;
    const rowsCount = Math.pow(2, inputs.length);
    const table: TruthTable = [[...inputs, ...outputs]];

    /* No momento vamos so jogar o erro. */
    if (error) {
        return { error: error.reason };
    }

    for (let i = 0; i < rowsCount; i++) {
        const row: number[] = [];
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

export type SumOfProductsOptions = {
    includeOutput: boolean
}

export function sumOfProducts(truthTable: TruthTable, {
    includeOutput = false,
}: Partial<SumOfProductsOptions> = {}) {
    const [ head, ...rows ] = truthTable;
    const inputs = head.slice(0, -1);
    const outputIndex = head.length - 1;
    let expression = '';

    const { isValid, reason } = validateTruthTable(truthTable);

    if (!isValid) {
        return { error: reason }
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
            return (
                acc + 
                (j > 0 ? AND.token : '') + 
                (value === 1 ? inputs[j] : NOT.token + inputs[j])
            )
        }, '');

        if (i > 0) {
            expression += ' ' + OR.token + ' ';
        }

        expression += product;
    }

    return { expression };
}

