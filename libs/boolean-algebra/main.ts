
import { sumOfProducts, truthTable } from "./lib";


const table = truthTable("~(A + B) . (~C ^ D + E) == C . D").table;

const { expression, error } = sumOfProducts(
    table, 
    { includeOutput: true }
);

console.log(expression, error)
