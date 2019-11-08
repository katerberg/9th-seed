const fs = require('fs');
const util = require('util');

fs.readFileAsync = util.promisify(fs.readFile);
fs.writeFileAsync = util.promisify(fs.writeFile);

function getInsertsFromCsv(csv) {
  const insertStatements = [];
  const records = parse(csv);
  records.forEach(([record]) => {
    insertStatements.push(createInsertStatement(record));
  });
  return insertStatements;
}

function runScripts(scripts, number) {
  if (scripts.length === number) {
    return;
  }
  return connection.queryAsync(scripts[number])
    .then(() => runScripts(scripts, number + 1))
    .catch((e) => {
      console.log(`SQL was unhappy with ${scripts[number]}`);
      console.log(e);
    });
}

fs.readFileAsync(`${process.cwd()}/setup/VintageCards.json`, 'utf-8').then((textFile) => {
  const cards = JSON.parse(textFile);
  const cardNames = JSON.stringify(Object.keys(cards)).slice(1, -1);
  fs.writeFile(`${process.cwd()}/setup/AllCards.json`, cardNames, (err) => {
    if (err) throw err;
  });
}).catch((e) => {
  console.log('There was an error');
  console.log(e);
});


