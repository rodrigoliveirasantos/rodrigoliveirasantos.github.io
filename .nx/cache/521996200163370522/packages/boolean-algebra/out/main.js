"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const table = (0, lib_1.truthTable)("~(A + B) . (~C ^ D + E) == C . D").table;
const { expression, error } = (0, lib_1.sumOfProducts)(table, { includeOutput: true });
console.log(expression, error);
