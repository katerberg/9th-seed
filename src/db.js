const mysql = require('mysql');
const dbInfo = require('../creds/dbCreds.json');

const pool = mysql.createPool(dbInfo);

pool.on('error', (err) => {
  console.log('db error', err);
  console.error('something went terribly wrong with an error of mysql');
});

module.exports = pool;
