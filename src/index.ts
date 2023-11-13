import { Canister, query, text, update, Vec, nat32, Principal, Record, StableBTreeMap, ic } from 'azle';

// This is a global variable that is stored on the heap
let message = '';

const Operation = Record({
    operationCreator: Principal,
    operation: text,
    result: nat32,
});

let operations = StableBTreeMap(Principal, Operation, 0);

export default Canister({
    getOperations: query([], Vec(Operation), () => {
        return operations.values();
    }),
    doOperation: update([text, text, text], Operation, (op1, op, op2) => {
        
        //Creamos un ID utilizando la función privada declarada más abajo.
        const id = generateId();

        let operationResult = 0;
        switch (op) {
            case "+":
                operationResult = parseInt(op1) + parseInt(op2);
                break;
            
            case "-":
                operationResult = parseInt(op1) - parseInt(op2);
                break;

            case "*":
                operationResult = parseInt(op1) * parseInt(op2);
                break;

            case "/":
                operationResult = parseInt(op2) !== 0 ? parseInt(op1) / parseInt(op2) : 0;
                break;
        
            default:
                operationResult = 0;
                break;
        }

        //E instanciamos la clase que creamos.
        //Algo de importancia es ic.caller(). ic es un objeto que contiene información sobre
        //la transacción. En este caso estamos usando la propiedad caller para obtener el dato
        //de quien llamó el método y almacenarlo en la blockchain. El tipo de este dato es Principal.
        const operation: typeof Operation = {
            operationCreator: ic.caller(),
            operation: `${op1} ${op} ${op2}`,
            result: operationResult,
        };

        //Como en cualquier mapa, almacenamos la información, usando el id que generamos como llave
        //y el post como valor.
        operations.insert(id, operation);
        
        console.log(`New Operation created! ID:`, id.toText());
        return operation;
    })
});

function generateId(): Principal {
    const randomBytes = new Array(29)
        .fill(0)
        .map((_) => Math.floor(Math.random() * 256));

    return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}
