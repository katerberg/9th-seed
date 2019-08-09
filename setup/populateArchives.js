const fs = require('fs');
const readline = require('readline');
const util = require('util');
const mysql = require('mysql');
const dbInfo = require('../creds/dbCreds.json');
const parse = require('csv-parse/lib/sync')

fs.readFileAsync = util.promisify(fs.readFile);
fs.readdirAsync = util.promisify(fs.readdir);

const connection = mysql.createConnection({
  ...dbInfo,
  multipleStatements: true,
});
connection.connectAsync = util.promisify(connection.connect);

connection.on('error', () => {
  console.error('something went terribly wrong connecting to mysql');
});

function getInsertsFromCsv(csv, draftName) {
  const records = parse(csv);
  records.forEach((record, row) => {
    if (record[0].match(/^\d+$/)) {
      const round = Number.parseInt(record[0]);
      const numberOfPicksBeforeRound = 8 * (round - 1);
      for (let i=1; i<=8; i++) {
        const pickNumber = numberOfPicksBeforeRound + (round % 2 === 0 ? 9 - i : i);
        console.log(`${draftName} pick ${round} (${pickNumber}) for ${records[0][i]} is ${record[i]}`);
      }
    }
  });
}

function addDrafts(drafts, number) {
  if (drafts.length === number) {
    return;
  }
  return fs.readFileAsync(`${process.cwd()}/drafts/${drafts[number]}`, 'utf-8').then((draftCsv) => {
    console.log(drafts[number]);
    console.log(draftCsv.split('\n')[0]);
    getInsertsFromCsv(draftCsv, drafts[number].split('.')[0]);
    return addDrafts(drafts, ++number);;
  });
}

connection.connectAsync().then(() => {
  console.log('Connected to DB');

  fs.readdirAsync(`${process.cwd()}/drafts`).then((items) => {
    addDrafts(items.filter(item => item.match(/\.csv$/)), 0).catch(()=>{return null;}).then(() => {
      connection.end();
    });
  });
});

