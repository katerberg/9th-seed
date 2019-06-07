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
  const voteFor = message.split(' ')[1];
  if (count <= 1) {
    return insertVote(username, voteFor);
  } else {
    return updateVote(username, voteFor);
  }
}

function getVotesQuery() {
  return 'SELECT username, COUNT(vote) FROM votes GROUP BY username;';
}

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
  } else if (message.startsWith('!youtube')) {
    return client.say(channelName, 'https://www.youtube.com/channel/UCpwS9X2A-5pmo1txhyD7eoA');
  } else if (message === '!votes') {
    connection.query(getVotesQuery(), (err, result) => {
      if (err) {
        console.error(err);
        console.error('Something went wrong getting votes');
      } else {
        console.log(result);
      }
    });
    return;
  }
}

function mods(channelName, message, user) {
  const isOwner = user.username === channelName;
  const isDope = user.mod || isOwner;
  if (isDope) {
    if (message.startsWith('!so') || message.startsWith('!shoutout')) {
      const msgArr = message.split(' ');
      return client.say(channelName, `Check out http://twitch.tv/${msgArr[1]} for some really cool content!`);
    } else if(message.startsWith('!vote ')) {
      upsertVote(user.username, message);
    }
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
