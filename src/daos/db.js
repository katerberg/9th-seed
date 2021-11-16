const mysql = require('mysql');
const dbInfo = require('../../creds/dbCreds.json');

const pool = mysql.createPool({connectionLimit: 10,
  multipleStatements: true,
  database: process.env.DB_NAME || dbInfo.database,
  host: process.env.DB_HOST || dbInfo.host,
  user: process.env.DB_USER || dbInfo.user,
  password: process.env.DB_PASSWORD || dbInfo.password,
  port: process.env.DB_PORT || 3307,
});

pool.on('error', (err) => {
  console.log('db error', err);
  console.error('something went terribly wrong with an error of mysql');
});

module.exports = pool;
