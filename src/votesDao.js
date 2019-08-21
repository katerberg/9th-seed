const connection = require('./db');
const {getCommandParams} = require('./utils');

const votesDao = {
  getPlayers: async() => new Promise((res, rej) => {
    connection.query(
      'SELECT name, shortName FROM players;',
      (err, result) => {
        if (err) {
          console.error('Error retrieving player list');
          return rej(err);
        }
        res(result);
      }
    );
  }),

  getVotes: async(username, category) => new Promise((res, rej) => {
    connection.query(
      'SELECT count(candidate) AS voteCount FROM votes WHERE username = ? AND category = ?;',
      [username, category],
      (err, result) => {
        if (err) {
          console.error(`Error retrieving vote count for ${username}`);
          return rej(err);
        }
        if (result.length !== 1) {
          throw new Error(`More than one user ${username}`);
        }
        res(result[0].voteCount);
      }
    );
  }),

  insertVote: async(username, vote, category) => new Promise((res, rej) => {
    connection.query(
      'INSERT INTO votes (username, candidate, category) VALUES (?, ?, ?);',
      [username, vote, category],
      (err) => {
        if (err) {
          console.error(err);
          console.error(
            `Something went wrong inserting vote for ${username}`
          );
          rej(err);
        } else {
          console.log('Win vote inserted');
          res(vote);
        }
      }
    );
  }),

  updateVote: async(username, vote, category) => new Promise((res, rej) => {
    connection.query(
      'UPDATE votes SET candidate = ? WHERE username = ? AND category = ?;',
      [vote, username, category],
      (err) => {
        if (err) {
          console.error(err);
          console.error(`Something went wrong updating vote for ${username}`);
          rej(err);
        } else {
          console.log('Vote updated');
          res(vote);
        }
      }
    );
  }),

  upsertVote: async(username, message, category) => {
    const count = await votesDao.getVotes(username, category);
    const voteFor = getCommandParams(message);
    const cleanVote = voteFor.toLowerCase();
    const players = await votesDao.getPlayers();
    if (!players.find(entry => entry.shortName === cleanVote)) {
      console.log(`Invalid vote by ${username} for ${voteFor}`);
      return Promise.reject('Invalid Entry');
    }
    if (count) {
      return votesDao.updateVote(username, cleanVote, category);
    }
    return votesDao.insertVote(username, cleanVote, category);

  },

  getAllVotes: async(category) => new Promise(res => {
    connection.query(
      'SELECT candidate, COUNT(username) as votes FROM votes WHERE category = ? GROUP BY candidate;',
      [category],
      (err, result) => {
        if (err) {
          console.error(err);
          console.error('Something went wrong getting votes');
        } else {
          res(result);
        }
      }
    );
  }),

  clearAllVotes: async(category) => new Promise(res => {
    connection.query(
      'DELETE FROM votes WHERE category = ?;',
      [category],
      (err) => {
        if (err) {
          console.error(err);
          console.error('Something went wrong clearing votes');
        } else {
          res();
        }
      }
    );
  }),
};

module.exports = votesDao;
