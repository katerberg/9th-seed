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
      this.connection.query('INSERT INTO votes (username, vote) VALUES (?, ?);', [username, vote], (err, result) => {
        if (err) {
          console.error(err);
          console.error(`Something went wrong inserting vote for ${username}`);
          rej(err);
        } else {
          console.log('Vote inserted');
          res(vote);
        }
      });
    });
  }

  async updateVote(username, vote) {
    return new Promise((res, rej) => {
      this.connection.query('UPDATE votes SET vote = ? WHERE username = ?;', [vote, username], (err, result) => {
        if (err) {
          console.error(err);
          console.error(`Something went wrong updating vote for ${username}`);
          rej(err);
        } else {
          console.log('Vote updated');
          res(vote);
        }
      });
    });
  }

  async upsertVote(username, message) {
    const count = await this.getVotes(username);
    const voteFor = getCommandParams(message);
    if (count) {
      return this.updateVote(username, voteFor);
    } else {
      return this.insertVote(username, voteFor);
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
