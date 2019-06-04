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

const connect = client.connect().then(msg => {
  console.log('Connected!');
});

function unpermissioned(channelName, message) {
  if (message.startsWith('!twitter')) {
    return client.say(channelName, 'Want to argue about VRD? https://twitter.com/stlvrd');
  } else if (message.startsWith('!salt')) {
    return client.say(channelName, 'PJSalt PJSalt PJSalt PJSalt');
  }
}

function mods(channelName, message, user) {
  const isOwner = user.username === channelName;
  const isDope = user.mod || isOwner;
  if ((message.startsWith('!so') || message.startsWith('!shoutout')) && isDope) {
    const msgArr = message.split(' ');
    return client.say(channelName, `Check out http://twitch.tv/${msgArr[1]} for some really cool content!`);
  }
}

client.on('chat', (channel, user, message, self) => {
  try {
    if (self) return;

    unpermissioned(channelName, message) ||
      mods(channelName, message, user);

  } catch(e) {
    console.error('Something went wrong trying to parse the message');
    console.log(e.message);
  }
});
