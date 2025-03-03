const fs = require('fs');
const util = require('util');
const mysql = require('mysql');
const dbInfo = require('../creds/dbCreds.json');
const parse = require('csv-parse/lib/sync');

fs.readFileAsync = util.promisify(fs.readFile);
fs.readdirAsync = util.promisify(fs.readdir);

const connection = mysql.createConnection({
  connectionLimit: 10,
  multipleStatements: true,
  database: process.env.DB_NAME || dbInfo.database,
  host: process.env.DB_HOST || dbInfo.host,
  user: process.env.DB_USER || dbInfo.user,
  password: process.env.DB_PASSWORD || dbInfo.password,
  port: process.env.DB_PORT || 3306,
});
connection.connectAsync = util.promisify(connection.connect);
connection.queryAsync = util.promisify(connection.query);

connection.on('error', () => {
  console.error('something went terribly wrong connecting to mysql');
});

const INSERT_TEMPLATE =
  'INSERT INTO oracle (card, releaseDate, colors, manaValue, manaCost, types) VALUES ("{card}", "{releaseDate}", "{colors}", "{manaValue}", "{manaCost}", "{types}");';

function createInsertStatement(
  cardName,
  releaseDate,
  colors = '',
  manaValue = 0,
  manaCost = '',
  types = 'Scheme'
) {
  return INSERT_TEMPLATE.replace(
    '{card}',
    cardName.toLowerCase().replace(/"/g, '\\"')
  )
    .replace('{releaseDate}', releaseDate)
    .replace('{colors}', colors)
    .replace('{manaValue}', manaValue)
    .replace('{manaCost}', manaCost)
    .replace('{types}', types);
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
  records.forEach(
    ([record, releaseDate, colors, manaValue, manaCost, types]) => {
      insertStatements.push(
        createInsertStatement(
          record,
          releaseDate,
          colors,
          manaValue,
          manaCost,
          types
        )
      );
    }
  );
  return insertStatements;
}

function runScripts(scripts, number) {
  if (scripts.length === number) {
    return;
  }
  return connection
    .queryAsync(scripts[number])
    .then(() => runScripts(scripts, number + 1))
    .catch((e) => {
      console.log(`Oracle: SQL was unhappy with ${scripts[number]}`);
      console.log(e);
    });
}

connection.connectAsync().then(() => {
  console.log('Connected to DB');

  fs.readFileAsync(`${process.cwd()}/setup/AllCards.csv`, 'utf-8')
    .then((draftCsv) => {
      const insertsFromCsv = getInsertsFromCsv(draftCsv);
      const inserts = [...insertsFromCsv, ...getInsertsFromArchives()];
      console.log('got some inserts');
      console.log(inserts && inserts.length);
      if (inserts && inserts.length) {
        return runScripts(inserts, 0);
      }
      console.log('Something went wrong inserting');
    })
    .catch((e) => {
      console.log('There was an error');
      console.log(e);
    })
    .then(() => {
      console.log('closing connection');
      connection.end();
    });
});
