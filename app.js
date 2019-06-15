const tmi = require("tmi.js");
const identity = require("./creds/twitchCreds.json");
const dbInfo = require("./creds/dbCreds.json");
const { VotesDataAccessObject } = require("./votesDao");
const { getCommandParams } = require("./utils");
const mysql = require("mysql");

const channelName = "stlvrd";
const tmiOptions = {
  option: {
    debug: true
  },
  connection: {
    reconnect: true
  },
  identity,
  channels: [channelName]
};

const connection = mysql.createConnection({
  ...dbInfo
});

connection.connect(err => {
  if (err) {
    throw err;
  }
  console.log("Connected to DB");
});

connection.on("error", () => {
  console.error("something went terribly wrong connecting to mysql");
});

const votesDao = new VotesDataAccessObject(connection);
const client = new tmi.client(tmiOptions);

client
  .connect()
  .then(msg => {
    console.log(`Connected to ${channelName}!`);
  })
  .catch(e => {
    console.error("Error connecting to Twitch");
  });

function say(message) {
  client.say(channelName, message);
}

function getWinsMessage() {
  return votesDao.getAllVotes().then(result => {
    const message = result.reduce(
      (a, c) =>
        `${a}\r\n${c.votes} vote${c.votes > 1 ? "s" : ""} for ${c.candidate}.`,
      ""
    );
    return say(message ? message : "No votes yet!");
  });
}

function unpermissioned(channelName, message, user) {
  if (message === "!twitter") {
    return say("Want to argue about VRD? https://twitter.com/stlvrd");
  } else if (message === "!salt") {
    return say("PJSalt PJSalt PJSalt PJSalt");
  } else if (message === "!vrd1") {
    return say(
      "https://docs.google.com/spreadsheets/d/1axKhYoW4HanXaSnp1UXZQkOS-p_HUrcLrL45qzfkMdE/edit?usp=sharing"
    );
  } else if (
    message === "!bracket" ||
    message === "!record" ||
    message === "!standings"
  ) {
    return say("https://challonge.com/yvl5j2oj/standings");
  } else if (
    message === "!vrd2" ||
    message === "!sheet" ||
    message === "!picks" ||
    message === "!decks" ||
    message === "!deck" ||
    message === "!decklist" ||
    message === "!decklists" ||
    message === "!draft"
  ) {
    return say(
      "Spreadsheet with draft picks is at https://docs.google.com/spreadsheets/d/1MKkuuQ1hYIE4_uOXEUBUcTMSu1yfsgwYgHjIGyNQtm4/edit?usp=sharing"
    );
  } else if (message === "!youtube") {
    return say(
      "Find our VODs on Twitch or on https://www.youtube.com/channel/UCpwS9X2A-5pmo1txhyD7eoA"
    );
  } else if (message === "!hs") {
    return say(
      "HeartSupport is a safe place online to talk about depression, anxiety, suicidal thoughts, eating disorders, self-harm, addictions or anything else that's hard. Catch the IRL stream talking about these kinds of issues at twitch.tv/heartsupport - MORE INFO: www.heartsupport.com"
    );
  } else if (message.startsWith("!win ")) {
    votesDao
      .upsertVote(user.username, message)
      .then(() => {
        return getWinsMessage();
      })
      .catch(e => {
        votesDao
          .getPlayers()
          .then(players => {
            const playerList = players.reduce((a, c) => {
              return a ? `${a}, ${c.shortName}` : c.shortName;
            }, "");
            return say(
              `I don't know who you're voting for. Try voting for one of these players: ${playerList}`
            );
          })
          .catch(() => {
            return say(
              'Error: votes can only be for players in the tournament. Try "!win naveen" instead'
            );
          });
      });
  } else if (message === "!wins") {
    return getWinsMessage();
  }
}

function mods(channelName, message, user) {
  const isOwner = user.username === channelName;
  const isDope = user.mod || isOwner;
  if (isDope) {
    if (message === "!so" || message === "!shoutout") {
      return say(
        `Check out http://twitch.tv/${getCommandParams(
          message
        )} for some really cool content!`
      );
    } else if (message === "!clearWinVotes") {
      return votesDao.clearAllVotes();
    }
  }
}

client.on("chat", (channel, user, message, self) => {
  try {
    if (self) return;

    unpermissioned(channelName, message, user) ||
      mods(channelName, message, user);
  } catch (e) {
    console.error("Something went wrong trying to parse the message");
    console.log(e.message);
  }
});
