const dbInfo = require('./creds/dbCreds.json');
const mysql = require('mysql');
const {getCommandParams}  = require('./utils');

class DataAccessObject {
  constructor() {
    this.connection = mysql.createConnection({
      ...dbInfo,
    });

    this.connection.connect(err => {
      if (err) {
        throw err;
      }
      console.log('Connected to DB');
    });

    this.connection.on('error', () => {
      console.log('something went terribly wrong');
    });
  }

  async getPlayers() {
    return new Promise((res, rej) => {
      this.connection.query('SELECT name, shortName FROM players;', (err, result) => {
        if (err) {
          console.error('Error retrieving player list');
          return rej(err);
        }
        res(result);
      });
    });
  }

  async getVotes(username) {
    return new Promise((res, rej) => {
      this.connection.query('SELECT count(vote) AS voteCount FROM votes WHERE username = ?;', [username], (err, result) => {
        if (err) {
          console.error(`Error retrieving vote count for ${username}`);
          return rej(err);
        }
        res(result.voteCount);
      });
    });
  }

  async insertVote(username, vote) {
    return new Promise((res, rej) => {
      this.connection.query('INSERT INTO votes (username, vote) VALUES (?, ?);', [username, cleanVote], (err, result) => {
        if (err) {
          console.error(err);
          console.error(`Something went wrong inserting vote for ${username}`);
          rej(err);
        } else {
          console.log('Vote inserted');
          res(cleanVote);
        }
      });
    });
  }

  async updateVote(username, vote) {
    return new Promise((res, rej) => {
      this.connection.query('UPDATE votes SET vote = ? WHERE username = ?;', [cleanVote, username], (err, result) => {
        if (err) {
          console.error(err);
          console.error(`Something went wrong updating vote for ${username}`);
          rej(err);
        } else {
          console.log('Vote updated');
          res(cleanVote);
        }
      });
    });
  }

  async upsertVote(username, message) {
    const count = await this.getVotes(username);
    const voteFor = getCommandParams(message);
    const cleanVote = voteFor.toLowerCase();
    const players = await getPlayers();
    if (!players.find(entry => entry.shortName === cleanVote)) {
      console.error(`Invalid vote by ${username} for ${vote}`);
      return Promise.reject('Invalid Entry');
    }
    if (count) {
      return this.updateVote(username, cleanVote);
    } else {
      return this.insertVote(username, cleanVote);
    }
  }

  async getAllVotes() {
    return new Promise(res => {
      this.connection.query('SELECT vote AS candidate, COUNT(username) as votes FROM votes GROUP BY vote;', (err, result) => {
        if (err) {
          console.error(err);
          console.error('Something went wrong getting votes');
        } else {
          res(result);
        }
      });
    });
  }

  async clearAllVotes() {
    return new Promise(res => {
      this.connection.query('DELETE FROM votes;', (err, result) => {
        if (err) {
          console.error(err);
          console.error('Something went wrong clearing votes');
        } else {
          res();
        }
      });
    });
  }
}

module.exports = {
  DataAccessObject,
}
