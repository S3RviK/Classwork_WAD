 // ==========================================
// 1. UI SELECTORS
// ==========================================
const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const operationSelect = document.getElementById('operation');
const calculateBtn = document.getElementById('calculate-btn');
const resultStatus = document.getElementById('result-status');

// ==========================================
// 2. TODO: BASIC CALLBACK MATH FUNCTIONS (Students write these)
// ==========================================

// TODO: Write "add" callback expression (a, b) => ...
const add = (a, b) => a + b;
// function add(a, b) { return a + b; }

// TODO: Write "subtract" callback expression (a, b) => ...
const subtract = (a, b) => a - b;
// function subtract(a, b) { return a - b; }

// TODO: Write "multiply" callback expression (a, b) => ...
const multiply = (a, b) => a * b;
// function multiply(a, b) {
//     return a * b;
// }

// TODO: Write "divide" callback expression (a, b) => ...
const divide = (a, b) => {
    if (b === 0) { throw new Error("Division by zero is not allowed.");}
    return a / b;
}
// Rule: Guard against division-by-zero! Return an Error or string warning.



// ==========================================
// 3. TODO: HIGHER-ORDER FUNCTION ENGINE (Students write this)
// ==========================================

// TODO: Write the "calculator" orchestrator function
// Arguments: numA (Number), numB (Number), callback (Function)
// Checks:
//   - Is numA and numB actually valid numbers?
//   - Is callback actually a function?
// Execution: Returns callback(numA, numB)
const calculator = (numA, numB, callback) => {
    if (Number.isNaN(numA) || Number.isNaN(numB)) {
        throw new Error('Please enter valid numbers in both inputs.');
    }
    if (typeof callback !== 'function') {
        throw new Error('Invalid operation selected.');
    }
    return callback(numA, numB);
};


// ==========================================
// 4. TODO: EVENT OBSERVER & INTEGRATION WIRING (Students write this)
// ==========================================
calculateBtn.addEventListener('click', () => {
    try {
        const valA = parseFloat(num1Input.value);
        const valB = parseFloat(num2Input.value);
        const operation = operationSelect.value;

        if (num1Input.value.trim() === '' || num2Input.value.trim() === '') {
            throw new Error('Please enter a number in both inputs.');
        }
        if (!operation) {
            throw new Error('Please select an operation.');
        }

        let targetCallback;
        switch (operation) {
            case 'add':
                targetCallback = add;
                break;
            case 'subtract':
                targetCallback = subtract;
                break;
            case 'multiply':
                targetCallback = multiply;
                break;
            case 'divide':
                targetCallback = divide;
                break;
            default:
                throw new Error('Invalid operation selected.');
        }

        const result = calculator(valA, valB, targetCallback);
        resultStatus.textContent = `Result: ${result}`;
        resultStatus.className = 'alert alert-success';
    } catch (error) {
        resultStatus.textContent = `Error: ${error.message}`;
        resultStatus.className = 'alert alert-danger';
    }
});