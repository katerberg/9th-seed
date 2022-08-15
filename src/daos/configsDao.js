const connection = require('./db');

const configsDao = {
  getConfig: async(name) => new Promise((res, rej) => {
    console.log(name);
    connection.query(
      'SELECT stored FROM configs WHERE config = ?;',
      [name],
      (err, result) => {
        if (err) {
          console.error(`Error retrieving stored value for ${name}`);
          return rej(err);
        }
        res(result);
      },
    );
  }),
  setConfig: async(config, result) => new Promise((res, rej) => {
    connection.query(
      'REPLACE INTO configs (config, stored) VALUES (?, ?);',
      [config, result],
      (err, result) => {
        if (err) {
          console.error(`Error storing ${config} value of ${result}`);
          return rej(err);
        }
        res(result);
      },
    );
  }),
};

module.exports = configsDao;
