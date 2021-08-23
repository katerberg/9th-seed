const fs = require('fs');
const util = require('util');
const mysql = require('mysql');
const dbInfo = require('../creds/dbCreds.json');
const parse = require('csv-parse/lib/sync');

fs.readFileAsync = util.promisify(fs.readFile);
fs.readdirAsync = util.promisify(fs.readdir);

const connection = mysql.createConnection({
  ...dbInfo,
  multipleStatements: true,
});
connection.connectAsync = util.promisify(connection.connect);
connection.queryAsync = util.promisify(connection.query);

connection.on('error', () => {
  console.error('something went terribly wrong connecting to mysql');
});

const INSERT_TEMPLATE = 'INSERT INTO oracle (card, releaseDate) VALUES ("{card}", "{releaseDate}")';

function createInsertStatement(cardName, releaseDate) {
  return INSERT_TEMPLATE
    .replace('{card}', cardName.toLowerCase().replace(/"/g, '\\"'))
    .replace('{releaseDate}', releaseDate);
}

function getInsertsFromArchives() {
  return [
    createInsertStatement('unknown', '2222-01-01'),
    createInsertStatement('unknown2', '2222-01-01'),
  ];
}

function getInsertsFromCsv(csv) {
  const insertStatements = [];
  const records = parse(csv);
  records.forEach(([record, releaseDate]) => {
    insertStatements.push(createInsertStatement(record, releaseDate));
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

connection.connectAsync().then(() => {
  console.log('Connected to DB');

  fs.readFileAsync(`${process.cwd()}/setup/AllCards.csv`, 'utf-8').then((draftCsv) => {
    const insertsFromCsv = getInsertsFromCsv(draftCsv);
    const inserts = [...insertsFromCsv, ...getInsertsFromArchives()];
    console.log('got some inserts');
    console.log(inserts && inserts.length);
    if (inserts && inserts.length) {
      return runScripts(inserts, 0);
    }
    console.log('Something went wrong inserting');

  }).catch((e) => {
    console.log('There was an error');
    console.log(e);
  }).then(() => {
    console.log('closing connection');
    connection.end();
  });
});


