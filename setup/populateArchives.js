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

const INSERT_DRAFT_TEMPLATE =
  'INSERT INTO drafts (draft, gid, occurrence) VALUES ("{draft}", "{gid}", "{occurrence}")';
const INSERT_ARCHIVE_TEMPLATE =
  'INSERT INTO archives (player, card, draft, pick) VALUES ("{player}", "{card}", "{draft}", {pick})';
const SELECT_ORACLE_TEMPLATE = 'SELECT card FROM oracle WHERE card = "{name}"';
const SELECT_LIKE_ORACLE_TEMPLATE =
  'SELECT card FROM oracle WHERE card like "{name}%"';

function getNumberOfPlayers(records) {
  return records[0].length - 1;
}

async function getInsertsFromCsv(csv, draftName, gid) {
  const insertStatements = [];
  const records = parse(csv);
  const numberOfPlayers = getNumberOfPlayers(records);
  console.debug(`${draftName} has ${numberOfPlayers} players`);
  for (let recordI = 0; recordI < records.length; recordI++) {
    // eslint-disable-line no-plusplus
    const record = records[recordI];
    if (record[0].match(/^Date$/)) {
      insertStatements.push(
        INSERT_DRAFT_TEMPLATE.replace('{draft}', draftName)
          .replace('{occurrence}', record[1])
          .replace('{gid}', gid)
      );
    }
    if (record[0].match(/^\d+$/)) {
      const round = Number.parseInt(record[0], 10);
      const numberOfPicksBeforeRound = numberOfPlayers * (round - 1);
      for (let i = 1; i <= numberOfPlayers; i++) {
        // eslint-disable-line no-plusplus
        const pickNumber =
          numberOfPicksBeforeRound +
          (round % 2 === 0 ? numberOfPlayers + 1 - i : i);
        let cardName = record[i].toLowerCase().replaceAll('"', '\\"');
        const selectResponse = await connection.queryAsync(
          SELECT_ORACLE_TEMPLATE.replace('{name}', cardName)
        );
        if (!selectResponse.length) {
          const permissiveResponse = await connection.queryAsync(
            SELECT_LIKE_ORACLE_TEMPLATE.replace('{name}', cardName)
          );
          if (permissiveResponse.length) {
            const permissiveCard = permissiveResponse[0].card;
            if (permissiveCard.includes('//')) {
              cardName = permissiveCard;
            }
          }
        }

        insertStatements.push(
          INSERT_ARCHIVE_TEMPLATE.replace('{player}', records[0][i])
            .replace('{card}', cardName)
            .replace('{pick}', pickNumber)
            .replace('{draft}', draftName)
        );
      }
    }
  }
  return insertStatements;
}

function addDrafts(drafts, number, insertStatements) {
  if (drafts.length === number) {
    return insertStatements;
  }
  return fs
    .readFileAsync(`${process.cwd()}/drafts/${drafts[number]}`, 'utf-8')
    .then(async (draftCsv) => {
      const [draftName, gidName] = drafts[number].split('_');
      const inserts = await getInsertsFromCsv(
        draftCsv,
        draftName,
        gidName.split('.')[0]
      );
      return addDrafts(drafts, number + 1, [...insertStatements, ...inserts]);
    });
}

function runScripts(scripts, number) {
  if (scripts.length === number) {
    return;
  }
  return connection
    .queryAsync(scripts[number])
    .then(() => runScripts(scripts, number + 1))
    .catch((e) => {
      console.log(`Archives: SQL was unhappy with ${scripts[number]}`);
      console.log(e);
    });
}

connection.connectAsync().then(() => {
  console.log('Connected to DB');

  fs.readdirAsync(`${process.cwd()}/drafts`).then((items) => {
    addDrafts(
      items.filter((item) => item.match(/\.csv$/)),
      0,
      ['DELETE FROM archives', 'DELETE FROM drafts']
    )
      .then((inserts) => {
        console.log('got some inserts');
        console.log(inserts && inserts.length);
        if (inserts && inserts.length) {
          return runScripts(inserts, 0);
        }
        console.log('Something went wrong inserting');
      })
      .catch((e) => {
        console.log('Error inserting');
        console.log(e);
      })
      .then(() => {
        console.log('closing connection');
        connection.end();
      });
  });
});
