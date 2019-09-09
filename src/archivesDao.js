const connection = require('./db');

const archivesDao = {
  getDrafts: async() => new Promise((res, rej) => {
    connection.query(
      'SELECT draft FROM archives GROUP BY draft;',
      (err, result) => {
        if (err) {
          console.error(`Error retrieving draft names`);
          return rej(err);
        }
        res(result);
      }
    );
  }),
  getStatsForCard: async(name) => new Promise((res, rej) => {
    connection.query(
      'SELECT card, avg(pick) as average, count(*) as numberTaken FROM archives WHERE card LIKE ? GROUP BY card;',
      [`${name}%`],
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
