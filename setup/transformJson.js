const fs = require('fs');
const util = require('util');

fs.readFileAsync = util.promisify(fs.readFile);
fs.writeFileAsync = util.promisify(fs.writeFile);


fs.readFileAsync(`${process.cwd()}/setup/VintageCards.json`, 'utf-8').then((textFile) => {
  const cards = JSON.parse(textFile);
  const cardNames = JSON.stringify(Object.keys(cards)).slice(1, -1);
  fs.writeFile(`${process.cwd()}/setup/AllCards.json`, cardNames, (err) => {
    if (err) {
      throw err;
    }
  });
}).catch((e) => {
  console.log('There was an error');
  console.log(e);
});


