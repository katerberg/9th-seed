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

const INSERT_CONFIG_TEMPLATE = 'INSERT INTO configs (config, stored) VALUES ("{config}", "{stored}")';

function getInsert(config, value) {
  return INSERT_CONFIG_TEMPLATE.replace('{config}', config).replace('{stored}', value);
}

function runScripts(scripts, number) {
  if (scripts.length === number) {
    return;
  }
  return connection.queryAsync(scripts[number])
    .then(() => runScripts(scripts, number + 1))
    .catch((e) => {
      console.log(`Config: SQL was unhappy with ${scripts[number]}`);
      console.log(e);
    });
}

connection.connectAsync().then(() => {
  console.log('Connected to DB');
  const inserts = [
    'DELETE FROM configs',
    getInsert('sheet', 'https://docs.google.com/spreadsheets/d/1yHAVTi7N8n42lvQirCX2j7VBgTUNADx4Lcfv-Aq027s/edit?usp=sharing'),
    getInsert('challonge', 'https://challonge.com/stlotus10'),
  ];

  runScripts(inserts, 0).catch((e) => {
    console.log('Error inserting configs');
    console.log(e);
  }).then(() => {
    console.log('closing connection');
    connection.end();
  });
});

