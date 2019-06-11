const tmi = require("tmi.js");
const identity = require("./creds/twitchCreds.json");
const dbInfo = require("./creds/dbCreds.json");
const { WinsDataAccessObject } = require("./winsDao");
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

const winsDao = new WinsDataAccessObject(connection);
const client = new tmi.client(tmiOptions);

client
  .connect()
  .then(msg => {
    console.log(`Connected to ${channelName}!`);
  })
  .catch(e => {
    console.error("Error connecting to Twitch");
  });

function unpermissioned(channelName, message, user) {
  if (message === "!twitter") {
    return client.say(
      channelName,
      "Want to argue about VRD? https://twitter.com/stlvrd"
    );
  } else if (message === "!salt") {
    return client.say(channelName, "PJSalt PJSalt PJSalt PJSalt");
  } else if (message === "!vrd1") {
    return client.say(
      channelName,
      "https://docs.google.com/spreadsheets/d/1axKhYoW4HanXaSnp1UXZQkOS-p_HUrcLrL45qzfkMdE/edit?usp=sharing"
    );
  } else if (message === "!bracket" || message === "!record") {
    return client.say(channelName, "https://challonge.com/yvl5j2oj/standings");
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
    return client.say(
      channelName,
      "Spreadsheet with draft picks is at https://docs.google.com/spreadsheets/d/1MKkuuQ1hYIE4_uOXEUBUcTMSu1yfsgwYgHjIGyNQtm4/edit?usp=sharing"
    );
  } else if (message === "!youtube") {
    return client.say(
      channelName,
      "Find our VODs on Twitch or on https://www.youtube.com/channel/UCpwS9X2A-5pmo1txhyD7eoA"
    );
  } else if (message.startsWith("!win ")) {
    winsDao.upsertWinVote(user.username, message).catch(e => {
      return client.say(
        channelName,
        'Error: votes can only be for players in the tournament. Try "!win naveen" instead'
      );
    });
  } else if (message === "!wins") {
    return winsDao.getAllWinVotes().then(wins => {
      const winsMessage = wins.reduce(
        (a, c) =>
          `${a}\r\n${c.wins} vote${c.wins > 1 ? "s" : ""} for ${
            c.candidate
          } to win.`,
        ""
      );
      return client.say(channelName, winsMessage ? winsMessage : "No votes yet!");
    });
  } else if (message === "!hs") {
     return client.say(channelName, "HeartSupport is a safe place online to talk about depression, anxiety, suicidal thoughts, eating disorders, self-harm, addictions or anything else that's hard. Catch the IRL stream talking about these kinds of issues at twitch.tv/heartsupport - MORE INFO: www.heartsupport.com");
  }
}

function mods(channelName, message, user) {
  const isOwner = user.username === channelName;
  const isDope = user.mod || isOwner;
  if (isDope) {
    if (message === "!so" || message === "!shoutout") {
      return client.say(
        channelName,
        `Check out http://twitch.tv/${getCommandParams(
          message
        )} for some really cool content!`
      );
    } else if (message === "!clearWinVotes") {
      return winsDao.clearAllWinVotes();
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
