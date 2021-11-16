const fs = require('fs');
const util = require('util');
const mysql = require('mysql');
const dbInfo = require('../creds/dbCreds.json');


fs.readFileAsync = util.promisify(fs.readFile);
fs.readdirAsync = util.promisify(fs.readdir);

const connection = mysql.createConnection({
  connectionLimit: 10,
  multipleStatements: true,
  database: process.env.DB_NAME || dbInfo.database,
  host: process.env.DB_HOST || dbInfo.host,
  user: process.env.DB_USER || dbInfo.user,
  password: process.env.DB_PASSWORD || dbInfo.password,
  port: process.env.DB_PORT || 3307,
});
connection.connectAsync = util.promisify(connection.connect);
connection.queryAsync = util.promisify(connection.query);

connection.on('error', () => {
  console.error('something went terribly wrong connecting to mysql');
});

connection.connectAsync().then(() => {
  console.log('Connected to DB');

  function runScripts(scripts, number) {
    if (scripts.length === number) {
      return;
    }
    return fs.readFileAsync(`${process.cwd()}/sql/${scripts[number]}`, 'utf-8').then((sqlScript) => connection.queryAsync(sqlScript)
      .then(() => {
        console.log(`Finished running ${scripts[number]}`);
        return runScripts(scripts, number + 1);
      })
      .catch((e) => {
        console.log(`SQL was unhappy with ${scripts[number]}`);
        console.log(e);
      }));
  }

  fs.readdirAsync(`${process.cwd()}/sql`).then((items) => {
    items.sort((a, b) => {
      const regex = /^\d+/;
      return Number.parseInt(a.match(regex)[0], 10) > Number.parseInt(b.match(regex)[0], 10);
    });
    runScripts(items, 0).catch(() => null).then(() => {
      connection.end();
    });
  });
});
