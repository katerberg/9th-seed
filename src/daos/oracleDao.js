const connection = require('./db');

const oracleDao = {
  isValidCardName: async (name) =>
    new Promise((res, rej) => {
      connection.query(
        'SELECT card FROM oracle WHERE card = ?;',
        [name],
        (err, result) => {
          if (err) {
            console.error(`Error retrieving valid card name for ${name}`);
            return rej(err);
          }
          res(result.length);
        }
      );
    }),
  getCardsLike: async (name) =>
    new Promise((res, rej) => {
      connection.query(
        'SELECT card FROM oracle WHERE card LIKE ?;',
        [name],
        (err, result) => {
          if (err) {
            console.error(`Error retrieving like card name for ${name}`);
            return rej(err);
          }
          res(result);
        }
      );
    }),
  getRelevantMatches: async (name) =>
    new Promise((res, rej) => {
      connection.query(
        `SELECT oracle.card, MATCH(oracle.card) AGAINST(?) AS Relevance
FROM oracle
INNER JOIN archives ON archives.card = oracle.card
GROUP BY oracle.card
ORDER BY relevance DESC
LIMIT 100;`,
        [name],
        (err, result) => {
          if (err) {
            console.error(`Error retrieving fuzzy match for ${name}`);
            return rej(err);
          }
          res(result);
        }
      );
    }),
};

module.exports = oracleDao;
