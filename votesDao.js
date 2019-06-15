const { getCommandParams } = require("./utils");

class VotesDataAccessObject {
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

  async getVotes(username) {
    return new Promise((res, rej) => {
      this.connection.query(
        "SELECT count(candidate) AS voteCount FROM votes WHERE username = ?;",
        [username],
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
    });
  }

  async insertVote(username, vote) {
    return new Promise((res, rej) => {
      this.connection.query(
        "INSERT INTO votes (username, candidate, label) VALUES (?, ?, 'default');",
        [username, vote],
        (err, result) => {
          if (err) {
            console.error(err);
            console.error(
              `Something went wrong inserting vote for ${username}`
            );
            rej(err);
          } else {
            console.log("Win vote inserted");
            res(vote);
          }
        }
      );
    });
  }

  async updateVote(username, vote) {
    return new Promise((res, rej) => {
      this.connection.query(
        "UPDATE votes SET candidate = ? WHERE username = ? AND label = 'default';",
        [vote, username],
        (err, result) => {
          if (err) {
            console.error(err);
            console.error(`Something went wrong updating vote for ${username}`);
            rej(err);
          } else {
            console.log("Vote updated");
            res(vote);
          }
        }
      );
    });
  }

  async upsertVote(username, message) {
    const count = await this.getVotes(username);
    const voteFor = getCommandParams(message);
    const cleanVote = voteFor.toLowerCase();
    const players = await this.getPlayers();
    if (!players.find(entry => entry.shortName === cleanVote)) {
      console.error(`Invalid vote by ${username} for ${voteFor}`);
      return Promise.reject("Invalid Entry");
    }
    if (count) {
      return this.updateVote(username, cleanVote);
    } else {
      return this.insertVote(username, cleanVote);
    }
  }

  async getAllVotes() {
    return new Promise(res => {
      this.connection.query(
        "SELECT candidate, COUNT(username) as votes FROM votes GROUP BY candidate;",
        (err, result) => {
          if (err) {
            console.error(err);
            console.error("Something went wrong getting votes");
          } else {
            res(result);
          }
        }
      );
    });
  }

  async clearAllVotes() {
    return new Promise(res => {
      this.connection.query("DELETE FROM votes;", (err, result) => {
        if (err) {
          console.error(err);
          console.error("Something went wrong clearing votes");
        } else {
          res();
        }
      });
    });
  }
}

module.exports = {
  VotesDataAccessObject
};
