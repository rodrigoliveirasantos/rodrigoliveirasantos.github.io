export class OperatorNotFoundError extends Error {
    constructor(token: string) {
        super(`Operador com token ${token} não foi encontrado.`);
    }
}
