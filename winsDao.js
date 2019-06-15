const { getCommandParams } = require("./utils");

class WinsDataAccessObject {
  constructor(connection) {
    this.connection = connection;
  }

  async getPlayers() {
    return new Promise((res, rej) => {
      this.connection.query(
        "SELECT name, shortName FROM players;",
        (err, result) => {
          if (err) {
            console.error("Error retrieving player list");
            return rej(err);
          }
          res(result);
        }
      );
    });
  }

  async getWinsVotes(username) {
    return new Promise((res, rej) => {
      this.connection.query(
        "SELECT count(vote) AS winCount FROM wins WHERE username = ?;",
        [username],
        (err, result) => {
          if (err) {
            console.error(`Error retrieving win count for ${username}`);
            return rej(err);
          }
          if (result.length !== 1) {
            throw new Error(`More than one user ${username}`);
          }
          res(result[0].winCount);
        }
      );
    });
  }

  async insertWinVote(username, win) {
    return new Promise((res, rej) => {
      this.connection.query(
        "INSERT INTO wins (username, vote) VALUES (?, ?);",
        [username, win],
        (err, result) => {
          if (err) {
            console.error(err);
            console.error(`Something went wrong inserting win for ${username}`);
            rej(err);
          } else {
            console.log("Win vote inserted");
            res(win);
          }
        }
      );
    });
  }

  async updateWinVote(username, win) {
    return new Promise((res, rej) => {
      this.connection.query(
        "UPDATE wins SET vote = ? WHERE username = ?;",
        [win, username],
        (err, result) => {
          if (err) {
            console.error(err);
            console.error(`Something went wrong updating win for ${username}`);
            rej(err);
          } else {
            console.log("Win updated");
            res(win);
          }
        }
      );
    });
  }

  async upsertWinVote(username, message) {
    const count = await this.getWinsVotes(username);
    const winFor = getCommandParams(message);
    const cleanWin = winFor.toLowerCase();
    const players = await this.getPlayers();
    if (!players.find(entry => entry.shortName === cleanWin)) {
      console.error(`Invalid win vote by ${username} for ${winFor}`);
      return Promise.reject("Invalid Entry");
    }
    if (count) {
      return this.updateWinVote(username, cleanWin);
    } else {
      return this.insertWinVote(username, cleanWin);
    }
  }

  async getAllWinVotes() {
    return new Promise(res => {
      this.connection.query(
        "SELECT vote AS candidate, COUNT(username) as wins FROM wins GROUP BY vote;",
        (err, result) => {
          if (err) {
            console.error(err);
            console.error("Something went wrong getting wins");
          } else {
            res(result);
          }
        }
      );
    });
  }

  async clearAllWinVotes() {
    return new Promise(res => {
      this.connection.query("DELETE FROM wins;", (err, result) => {
        if (err) {
          console.error(err);
          console.error("Something went wrong clearing wins");
        } else {
          res();
        }
      });
    });
  }
}

module.exports = {
  WinsDataAccessObject
};
