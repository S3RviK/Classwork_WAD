/*
    Fibonacci Sequence - Enter a number and have the program
    generate the Fibonacci sequence to that number or to the Nth number.
*/
// This array will keep memory of the previous fibonacci numbers
var memo = {};

function fibonacci() {
  "use strict";
  var n = parseInt(document.getElementById("num").value, 10);
  var val = f(n);
  var output = document.getElementById("fibonacciLbl");

  if (output) {
    output.textContent = val;
  }

  return val;
}

function f(n) {
  var value;
  var number = parseInt(n, 10);

  if (isNaN(number) || number < 0) {
    return 0;
  }

  if (memo.hasOwnProperty(number)) {
    value = memo[number];
  } else if (number === 0 || number === 1) {
    value = number;
  } else {
    value = f(number - 1) + f(number - 2);
    memo[number] = value;
  }

  return value;
}
