const mysql = require('mysql');
const dbInfo = require('../creds/dbCreds.json');

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbInfo);

  connection.connect((err) => {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('Connected to DB');
    }
  });

  connection.on('error', (err) => {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      console.error('something went terribly wrong with an error of mysql');
    }
  });
}

handleDisconnect();

module.exports = connection;
