const connection = require('./db');

const archivesDao = {
  getNumberOfDraftsLegalForCard: async(name) => new Promise((res, rej) => {
    connection.query(
      'SELECT count(drafts.draft) as numberOfDrafts ' +
      'FROM drafts ' +
      'LEFT JOIN oracle on oracle.releaseDate BETWEEN "1000-01-01" AND drafts.occurance ' +
      'WHERE oracle.card LIKE ? ' +
      'GROUP BY oracle.card;',
      [`${name}%`],
      (err, result) => {
        if (err) {
          console.error(`Error retrieving number of drafts legal for ${name}`);
          return rej(err);
        }
        res(result);
      }
    );
  }),
  getStatsForCard: async(name) => new Promise((res, rej) => {
    connection.query(
      'SELECT card, avg(pick) as average, count(*) as numberTaken ' +
      'FROM archives ' +
      'WHERE card LIKE ? ' +
      'GROUP BY card;',
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
