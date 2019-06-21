const tmi = require("tmi.js");
const identity = require("../creds/twitchCreds.json");

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
  if (message) {
    client.say(channelName, message);
  }
}

function onChat(callback) {
  client.on('chat', callback);
}

module.exports = {
  onChat,
  say,
};
