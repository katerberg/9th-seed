const connection = require('./db');

const oracleDao = {
  isValidCardName: async (name) =>
    new Promise((res, rej) => {
      connection.query(
        'SELECT card FROM oracle WHERE card = ?;',
        [name],
        (err, result) => {
          if (err) {
            console.error(`Error retrieving number of times taken for ${name}`);
            return rej(err);
          }
          res(result.length);
        }
      );
    }),
};

module.exports = oracleDao;
