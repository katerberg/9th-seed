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

const INSERT_DRAFT_TEMPLATE = 'INSERT INTO drafts (draft, occurance) VALUES ("{draft}", "{occurance}")';
const INSERT_ARCHIVE_TEMPLATE = 'INSERT INTO archives (player, card, draft, pick) VALUES ("{player}", "{card}", "{draft}", {pick})';

function getNumberOfPlayers(records) {
  return records[0].length - 1;
}

function getInsertsFromCsv(csv, draftName) {
  const insertStatements = [];
  const records = parse(csv);
  const numberOfPlayers = getNumberOfPlayers(records);
  console.debug(`${draftName} has ${numberOfPlayers} players`);
  records.forEach((record) => {
    if (record[0].match(/^Date$/)) {
      insertStatements.push(INSERT_DRAFT_TEMPLATE
        .replace('{draft}', draftName)
        .replace('{occurance}', record[1]),
      );
    }
    if (record[0].match(/^\d+$/)) {
      const round = Number.parseInt(record[0], 10);
      const numberOfPicksBeforeRound = numberOfPlayers * (round - 1);
      for (let i = 1; i <= numberOfPlayers; i++) { // eslint-disable-line no-plusplus
        const pickNumber = numberOfPicksBeforeRound + (round % 2 === 0 ? numberOfPlayers + 1 - i : i);
        insertStatements.push(INSERT_ARCHIVE_TEMPLATE
          .replace('{player}', records[0][i])
          .replace('{card}', record[i].toLowerCase())
          .replace('{pick}', pickNumber)
          .replace('{draft}', draftName),
        );
      }
    }
  });
  return insertStatements;
}

function addDrafts(drafts, number, insertStatements) {
  if (drafts.length === number) {
    return insertStatements;
  }
  return fs.readFileAsync(`${process.cwd()}/drafts/${drafts[number]}`, 'utf-8').then((draftCsv) => {
    const inserts = getInsertsFromCsv(draftCsv, drafts[number].split('.')[0]);
    return addDrafts(drafts, number + 1, [...insertStatements, ...inserts]);
  });
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

  fs.readdirAsync(`${process.cwd()}/drafts`).then((items) => {
    addDrafts(items.filter(item => item.match(/\.csv$/)), 0, ['DELETE FROM archives']).then(inserts => {
      console.log('got some inserts');
      console.log(inserts && inserts.length);
      if (inserts && inserts.length) {
        return runScripts(inserts, 0);
      }
      console.log('Something went wrong inserting');

    }).catch((e) => {
      console.log('Error inserting');
      console.log(e);
    }).then(() => {
      console.log('closing connection');
      connection.end();
    });
  });
});

