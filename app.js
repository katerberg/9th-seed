const tmi = require('tmi.js');
const identity = require('./creds/twitchCreds.json');


const channelName = 'stlvrd';
const options = {
  option: {
    debug: true
  },
  connection: {
    reconnect: true
  },
  identity,
  channels: [channelName]
};
const client = new tmi.client(options);
let isQueueOpen = false;

const connect = client.connect().then(msg => {
  console.log('Connected!');
});

client.on('chat', (channel, user, message, self) => {
  if (self) return;

  const isOwner = user.username === channelName;
  const isDope = user.mod || isOwner;
  const msgArr = message.split(' ');

  if ((message.startsWith('!so') || message.startsWith('!shoutout')) && isDope) {
    client.say(channelName, `Check out http://twitch.tv/${msgArr[1]} for some really cool content!`);
  } else if (message.startsWith('!twitter')) {
    client.say(channelName, 'Want to argue about VRD? https://twitter.com/stlvrd');
  } else if (message.startsWith('!salt')) {
    client.say(channelName, 'PJSalt PJSalt PJSalt PJSalt');
  }
});
