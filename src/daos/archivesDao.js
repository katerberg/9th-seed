const connection = require('./db');

const archivesDao = {
  getMostCommonCards: async(limit = 50) => new Promise((res, rej) => {
    connection.query(
      'SELECT archives.card, avg(archives.pick) as averagePick, count(archives.card) as numberTaken ' +
      'FROM archives ' +
      'INNER JOIN oracle on oracle.card = archives.card ' +
      'RIGHT JOIN drafts on oracle.releaseDate BETWEEN "1000-01-01" AND drafts.occurance ' +
      'GROUP BY card ' +
      'ORDER BY numberTaken desc, averagePick asc ' +
      'LIMIT ?;',
      [limit],
      (err, result) => {
        console.log('RESULTresult');
        if (err) {
          console.error('Error retrieving most common cards');
          return rej(err);
        }
        res(result);
      },
    );
  }),
  getNumberOfDraftsLegalForCard: async(name) => new Promise((res, rej) => {
    connection.query(
      'SELECT count(drafts.draft) as numberOfDrafts ' +
      'FROM drafts ' +
      'LEFT JOIN oracle on oracle.releaseDate BETWEEN "1000-01-01" AND drafts.occurance ' +
      'WHERE oracle.card LIKE ? ' +
      'GROUP BY oracle.card ' +
      'ORDER BY oracle.card asc;',
      [`${name}%`],
      (err, result) => {
        if (err) {
          console.error(`Error retrieving number of drafts legal for ${name}`);
          return rej(err);
        }
        res(result);
      },
    );
  }),
  getStatsForCard: async(name) => new Promise((res, rej) => {
    connection.query(
      'SELECT card, avg(pick) as average, count(*) as numberTaken ' +
      'FROM archives ' +
      'WHERE card LIKE ? ' +
      'GROUP BY card ' +
      'ORDER BY card asc;',
      [`${name}%`],
      (err, result) => {
        if (err) {
          console.error(`Error retrieving stats for ${name}`);
          return rej(err);
        }
        res(result);
      },
    );
  }),
};

module.exports = archivesDao;
