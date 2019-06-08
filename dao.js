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
      console.error('something went terribly wrong connecting to mysql');
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

  async getWinVotess(username) {
    return new Promise((res, rej) => {
      this.connection.query('SELECT count(win) AS winCount FROM wins WHERE username = ?;', [username], (err, result) => {
        if (err) {
          console.error(`Error retrieving win count for ${username}`);
          return rej(err);
        }
        res(result.winCount);
      });
    });
  }

  async insertWinVote(username, win) {
    return new Promise((res, rej) => {
      this.connection.query('INSERT INTO wins (username, win) VALUES (?, ?);', [username, win], (err, result) => {
        if (err) {
          console.error(err);
          console.error(`Something went wrong inserting win for ${username}`);
          rej(err);
        } else {
          console.log('Win vote inserted');
          res(win);
        }
      });
    });
  }

  async updateWinVote(username, win) {
    return new Promise((res, rej) => {
      this.connection.query('UPDATE wins SET win = ? WHERE username = ?;', [win, username], (err, result) => {
        if (err) {
          console.error(err);
          console.error(`Something went wrong updating win for ${username}`);
          rej(err);
        } else {
          console.log('Win updated');
          res(win);
        }
      });
    });
  }

  async upsertWinVote(username, message) {
    const count = await this.getWins(username);
    const winFor = getCommandParams(message);
    const cleanWin = winFor.toLowerCase();
    const players = await getPlayers();
    if (!players.find(entry => entry.shortName === cleanWin)) {
      console.error(`Invalid win vote by ${username} for ${win}`);
      return Promise.reject('Invalid Entry');
    }
    if (count) {
      return this.updateWinVote(username, cleanWin);
    } else {
      return this.insertWinVote(username, cleanWin);
    }
  }

  async getAllWinVotes() {
    return new Promise(res => {
      this.connection.query('SELECT win AS candidate, COUNT(username) as wins FROM wins GROUP BY win;', (err, result) => {
        if (err) {
          console.error(err);
          console.error('Something went wrong getting wins');
        } else {
          res(result);
        }
      });
    });
  }

  async clearAllWins() {
    return new Promise(res => {
      this.connection.query('DELETE FROM wins;', (err, result) => {
        if (err) {
          console.error(err);
          console.error('Something went wrong clearing wins');
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
