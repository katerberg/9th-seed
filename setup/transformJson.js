const fs = require('fs');
const util = require('util');
const stringify = require('csv-stringify');

fs.readFileAsync = util.promisify(fs.readFile);
fs.writeFileAsync = util.promisify(fs.writeFile);
const stringifyAsync = util.promisify(stringify);


fs.readFileAsync(`${process.cwd()}/setup/VintageCards.json`, 'utf-8').then((textFile) => {
  const cards = Object.keys(JSON.parse(textFile));
  stringifyAsync(cards.map(c => [c])).then((output) => {
    fs.writeFile(`${process.cwd()}/setup/AllCards.csv`, output, (err) => {
      if (err) {
        throw err;
      }
    });
  }).catch((e) => {
    console.log('There was an error writing csv');
    console.log(e);
  });
}).catch((e) => {
  console.log('There was an error');
  console.log(e);
});


