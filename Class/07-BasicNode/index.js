const fs = require("fs");
const sw = require("star-wars-quotes");
const superheroes = require("superheroes");
const supervillains = require("supervillains");

console.log("Hello, world!");
console.log(sw());

const hero = superheroes.randomSuperhero();
const villain = supervillains.randomSupervillain();
console.log(`${hero} vs ${villain}`);

const secret = fs.readFileSync("./data/input.txt", "utf8");
console.log("Secret message:", secret.trim());
