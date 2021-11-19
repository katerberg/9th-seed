const connection = require('./db');

const archivesDao = {
  getMostCommonCards: async(ratio = 0.1, limit = 50) => new Promise((res, rej) => {
    console.log('ratio', ratio);
    console.log('limit', limit);
    connection.query(
      'SELECT * from ( ' +
      'SELECT a.card, a.averageRound, a.numberAvailable, a.numberTaken, a.numberTaken/a.numberAvailable as ratio from( ' +
        'SELECT archives.card ' +
        ',ceiling(avg(archives.pick)/8) as averageRound ' +
        ',( ' +
          'select count(*) ' +
          'from drafts ' +
          'where oracle.releaseDate ' +
          'BETWEEN "1000-01-01" AND drafts.occurance ' +
        ') as numberAvailable ' +
        ', count(*) as numberTaken ' +
             'FROM archives ' +
             'INNER JOIN oracle on oracle.card = archives.card ' +
             'GROUP BY card ' +
             ' ) a ' +
          ' ) b ' +
       'WHERE ratio > ? ' +
       'ORDER BY ' +
       'averageRound asc ' +
       ', ' +
       'ratio desc ' +
       ', ' +
       'numberTaken desc ' +
       'LIMIT ?;',
      [ratio, limit],
      (err, result) => {
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
