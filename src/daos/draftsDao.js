const connection = require('./db');

const draftsDao = {
  getDrafts: async() => new Promise((res, rej) => {
    connection.query(
      'SELECT draft FROM drafts;',
      (err, result) => {
        if (err) {
          console.error('Error retrieving draft names');
          return rej(err);
        }
        res(result);
      },
    );
  }),
};

module.exports = draftsDao;
