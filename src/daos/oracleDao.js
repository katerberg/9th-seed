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
  getValidCards: async (cardList) =>
    new Promise((res, rej) => {
      connection.query(
        'SELECT card FROM oracle WHERE card in (?);',
        [cardList],
        (err, result) => {
          if (err) {
            console.error('Error retrieving valid card list');
            return rej(err);
          }
          res(result);
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
};

module.exports = oracleDao;
