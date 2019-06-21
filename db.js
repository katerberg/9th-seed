var mysql = require("mysql");
const dbInfo = require("./creds/dbCreds.json");

var connection = mysql.createConnection({
  ...dbInfo
});

connection.connect(err => {
  if (err) {
    throw err;
  }
  console.log("Connected to DB");
});

connection.on("error", () => {
  console.error("something went terribly wrong connecting to mysql");
});

module.exports = connection;
