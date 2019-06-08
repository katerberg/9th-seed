const tmi = require('tmi.js');
const identity = require('./creds/twitchCreds.json');
const {DataAccessObject} = require('./dao');
const {getCommandParams}  = require('./utils');

const channelName = 'stlvrd';
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

const dao = new DataAccessObject();
const client = new tmi.client(tmiOptions);

client.connect().then(msg => {
  console.log(`Connected to ${channelName}!`);
});

function unpermissioned(channelName, message, user) {
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
  } else if (message.startsWith('!youtube')) {
    return client.say(channelName, 'https://www.youtube.com/channel/UCpwS9X2A-5pmo1txhyD7eoA');
  } else if(message.startsWith('!vote ')) {
    dao.upsertVote(user.username, message);
  } else if (message === '!votes') {
    return dao.getAllVotes().then(votes => {
      const votesMessage = votes.reduce((a, c) => `${a}\r\n${c.candidate} has ${c.votes} vote${c.votes > 1 ? 's' : ''}.`, '');
      client.say(channelName, votesMessage ? votesMessage : 'No votes yet!');
    });
  }
}

function mods(channelName, message, user) {
  const isOwner = user.username === channelName;
  const isDope = user.mod || isOwner;
  if (isDope) {
    if (message.startsWith('!so') || message.startsWith('!shoutout')) {
      return client.say(channelName, `Check out http://twitch.tv/${getCommandParams(message)} for some really cool content!`);
    } else if (message.startsWith('!clearVotes')) {
      return dao.clearAllVotes();
    }
  }
}

client.on('chat', (channel, user, message, self) => {
  try {
    if (self) return;

    unpermissioned(channelName, message, user) ||
      mods(channelName, message, user);

  } catch(e) {
    console.error('Something went wrong trying to parse the message');
    console.log(e.message);
  }
});
