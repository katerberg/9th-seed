const tmi = require('tmi.js');
const identity = require('../creds/twitchCreds.json');

const channelName = process.env.CHANNEL || 'stlotusmtg';
const tmiOptions = {
  option: {
    debug: true,
  },
  connection: {
    reconnect: true,
  },
  identity,
  channels: [channelName],
};

const client = new tmi.client(tmiOptions);

client
  .connect()
  .then(() => {
    console.log(`Connected to ${channelName}!`);
  })
  .catch(() => {
    console.error('Error connecting to Twitch');
  });

function say(message) {
  if (message) {
    switch (typeof message) {
    case 'string':
      client.say(channelName, message);
      break;
    case 'object':
      message.then(response => client.say(channelName, response));
      break;
    default:
      console.error('Unknown type of message');
    }
  }
}

function onChat(callback) {
  client.on('chat', callback);
}

module.exports = {
  onChat,
  say,
};
