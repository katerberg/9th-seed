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
  } else if (message.startsWith('!vrd1')) {
    return client.say(channelName, 'https://docs.google.com/spreadsheets/d/1axKhYoW4HanXaSnp1UXZQkOS-p_HUrcLrL45qzfkMdE/edit?usp=sharing');
  } else if (message.startsWith('!bracket') ||
    message.startsWith('!record')) {
    return client.say(channelName, 'https://challonge.com/yvl5j2oj/standings');
  } else if (message.startsWith('!vrd2') ||
    message.startsWith('!sheet') ||
    message.startsWith('!decklist') ||
    message.startsWith('!decklists') ||
    message.startsWith('!draft')) {
    return client.say(channelName, 'https://docs.google.com/spreadsheets/d/1MKkuuQ1hYIE4_uOXEUBUcTMSu1yfsgwYgHjIGyNQtm4/edit?usp=sharing');
  } else if (message.startsWith('!youtube') {
    return client.say(channelName, 'https://www.youtube.com/channel/UCpwS9X2A-5pmo1txhyD7eoA');
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
