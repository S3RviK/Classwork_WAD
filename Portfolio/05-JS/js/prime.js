/*
    Prime Factorization - Have the user enter a number and find
    all Prime Factors (if there are any) and display them.
*/

var getPrimeFactors = function (n) {
  "use strict";

  var inputValue = n;
  if (inputValue === undefined || inputValue === null || inputValue === "") {
    if (typeof document !== "undefined") {
      inputValue = document.getElementById("num") ? document.getElementById("num").value : "";
    }
  }

  function isPrime(value) {
    var i;

    if (value < 2) {
      return false;
    }

    for (i = 2; i <= Math.sqrt(value); i++) {
      if (value % i === 0) {
        return false;
      }
    }
    return true;
  }

  var i,
    sequence = [],
    value = Math.abs(parseInt(inputValue, 10));

  if (isNaN(value) || value < 2) {
    if (typeof document !== "undefined") {
      var output = document.getElementById("pf");
      if (output) {
        output.textContent = "";
      }
    }
    return sequence;
  }

  var originalValue = value;
  for (i = 2; i <= originalValue; i++) {
    while (originalValue % i === 0) {
      if (isPrime(i)) {
        sequence.push(i);
      }
      originalValue /= i;
    }
  }

  if (typeof document !== "undefined") {
    var output = document.getElementById("pf");
    if (output) {
      output.textContent = sequence.join(", ");
    }
  }

  return sequence;
};

// the prime factors for this number are: [ 2, 3, 5, 7, 11, 13 ]
console.log(getPrimeFactors(30030));
