const connection = require('./db');

const archivesDao = {
  getNumberOfTimesTaken: async(name) => new Promise((res, rej) => {
    connection.query(
      'SELECT card, count(*) as numberTaken FROM archives WHERE card = ? GROUP BY card;',
      [name],
      (err, result) => {
        if (err) {
          console.error(`Error retrieving number of times taken for ${name}`);
          return rej(err);
        }
        res(result);
      }
    );
  }),
};

module.exports = archivesDao;
