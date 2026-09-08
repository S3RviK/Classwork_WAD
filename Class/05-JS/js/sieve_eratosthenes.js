/*
    Sieve of Eratosthenes - The sieve of Eratosthenes is one of the most efficient ways
    to find all of the smaller primes (below 10 million or so).
*/

var sieve = function (n) {
  "use strict";

  var inputValue = n;
  if (inputValue === undefined || inputValue === null || inputValue === "") {
    if (typeof document !== "undefined") {
      inputValue = document.getElementById("num") ? document.getElementById("num").value : "";
    }
  }

  var limit = Math.max(parseInt(inputValue, 10) || 0, 0);
  var array = [];
  var primes = [];
  var i;
  var j;

  if (limit < 2) {
    if (typeof document !== "undefined") {
      var output = document.getElementById("primes");
      if (output) {
        output.textContent = "";
      }
    }
    return primes;
  }

  for (i = 0; i <= limit; i++) {
    array[i] = true;
  }

  array[0] = false;
  array[1] = false;

  for (i = 2; i * i <= limit; i++) {
    if (array[i]) {
      for (j = i * i; j <= limit; j += i) {
        array[j] = false;
      }
    }
  }

  for (i = 2; i <= limit; i++) {
    if (array[i]) {
      primes.push(i);
    }
  }

  if (typeof document !== "undefined") {
    var output = document.getElementById("primes");
    if (output) {
      output.textContent = primes.join(", ");
    }
  }

  return primes;
};

console.log(sieve(1000000));
