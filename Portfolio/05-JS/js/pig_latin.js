/*
Pig Latin
*/

function igpayAtinlay(str) {
  var input = str || "";
  var wordArray = input.trim().split(/\s+/).filter(Boolean);
  var returnArray = [];

  for (var i = 0; i < wordArray.length; i++) {
    var word = wordArray[i];
    var vowelIndex = -1;

    for (var ii = 0; ii < word.length; ii++) {
      if (/[aeiouAEIOU]/.test(word.charAt(ii))) {
        vowelIndex = ii;
        break;
      }
    }

    if (vowelIndex === 0) {
      returnArray.push(word + "way");
    } else if (vowelIndex === -1) {
      returnArray.push(word + "ay");
    } else {
      returnArray.push(word.slice(vowelIndex) + word.slice(0, vowelIndex) + "ay");
    }
  }

  return returnArray.join(" ");
}

// Some examples of expected outputs
console.log(igpayAtinlay("pizza")); // "izzapay"
console.log(igpayAtinlay("apple")); // "appleway"
console.log(igpayAtinlay("happy meal")); // "appyhay ealmay"
