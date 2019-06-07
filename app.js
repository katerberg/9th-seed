const tmi = require('tmi.js');
const identity = require('./creds/twitchCreds.json');
const dbInfo = require('./creds/dbCreds.json');
const mysql = require('mysql');

const connection = mysql.createConnection({
  ...dbInfo,
});

connection.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Connected to DB');
});

connection.on('error', function() {
  console.log('something went terribly wrong');
});

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
  console.log(`Connected to ${channelName}!`);
});

async function getVotes(username) {
  return new Promise((res, rej) => {
    connection.query('SELECT count(vote) AS voteCount FROM votes WHERE username = ?;', [username], (err, result) => {
      if (err) {
        console.error(`Error retrieving vote count for ${username}`);
        return rej(err);
      }
      res(result.voteCount);
    });
  });
}

async function insertVote(username, vote) {
  return new Promise((res, rej) => {
    connection.query('INSERT INTO votes (username, vote) VALUES (?, ?);', [username, vote], (err, result) => {
      if (err) {
        console.error(err);
        console.error(`Something went wrong inserting vote for ${username}`);
        rej(err);
      } else {
        console.log('Vote inserted');
        res(vote);
      }
    });
  });
}

async function updateVote(username, vote) {
  return new Promise((res, rej) => {
    connection.query('UPDATE votes SET vote = ? WHERE username = ?;', [vote, username], (err, result) => {
      if (err) {
        console.error(err);
        console.error(`Something went wrong updating vote for ${username}`);
        rej(err);
      } else {
        console.log('Vote updated');
        res(vote);
      }
    });
  });
}

async function upsertVote(username, message) {
  const count = await getVotes(username);
  const voteFor = getCommandParams(message);
  if (count) {
    return updateVote(username, voteFor);
  } else {
    return insertVote(username, voteFor);
  }
}

async function getAllVotes() {
  return new Promise(res => {
    connection.query('SELECT vote AS candidate, COUNT(username) as votes FROM votes GROUP BY vote;', (err, result) => {
      if (err) {
        console.error(err);
        console.error('Something went wrong getting votes');
      } else {
        res(result);
      }
    });
  });
}

async function clearAllVotes() {
  return new Promise(res => {
    connection.query('DELETE FROM votes;', (err, result) => {
      if (err) {
        console.error(err);
        console.error('Something went wrong clearing votes');
      } else {
        res();
      }
    });
  });
}

function getCommandParams(message) {
  return message.substr(message.indexOf(' ') + 1);
}
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
    upsertVote(user.username, message);
  } else if (message === '!votes') {
    return getAllVotes().then(votes => {
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
      return clearAllVotes();
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
