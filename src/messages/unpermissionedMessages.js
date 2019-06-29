const votesDao = require('../votesDao');
const {WIN_CATEGORY, INTERVIEW_CATEGORY} = require('../constants');


function getVoteResults(category) {
  return votesDao.getAllVotes(category).then(result => {
    const message = result.reduce(
      (a, c) =>
        `${a}\r\n${c.votes} vote${c.votes > 1 ? 's' : ''} for ${c.candidate}.`,
      ''
    );
    return message ? message : 'No votes yet!';
  });
}

function addVoteAndReportResult(username, category, message) {
  return votesDao
    .upsertVote(username, message, category)
    .then(() => getVoteResults(category))
    .catch(() => {
      votesDao
        .getPlayers()
        .then(players => {
          const playerList = players.reduce((a, c) => {
            if (a) {
              return `${a}, ${c.shortName}`;
            }
            return c.shortName;

          }, '');
          return `I don't know who you're voting for. Try voting for one of these players: ${playerList}`;
        })
        .catch(() => 'Error: votes can only be for players in the tournament. Try "!win naveen" instead');
    });
}

function getUnpermissionedResponse(message, user) {
  if (message === '!twitter') {
    return 'Want to argue about VRD? https://twitter.com/stlvrd';
  } else if (message === '!salt') {
    return 'PJSalt PJSalt PJSalt PJSalt';
  } else if (message === '!vrd1' || message === '!vrd2' || message === '!archives') {
    return 'https://docs.google.com/spreadsheets/d/1AdrhWkDX7i9p2rZbEKzDs3nQAhCvcH0LAXZQNwWMsnA/edit#gid=945529176';
  } else if (
    message === '!bracket' ||
    message === '!record' ||
    message === '!standings'
  ) {
    return 'https://challonge.com/yvl5j2oj/standings';
  } else if (
    message === '!vrd2' ||
    message === '!sheet' ||
    message === '!picks' ||
    message === '!decks' ||
    message === '!deck' ||
    message === '!decklist' ||
    message === '!decklists' ||
    message === '!draft'
  ) {
    return 'Spreadsheet with draft picks is at https://docs.google.com/spreadsheets/d/1MKkuuQ1hYIE4_uOXEUBUcTMSu1yfsgwYgHjIGyNQtm4/edit?usp=sharing';
  } else if (message === '!youtube') {
    return 'Find our VODs on Twitch or on https://www.youtube.com/channel/UCpwS9X2A-5pmo1txhyD7eoA';
  } else if (message === '!hs') {
    return 'HeartSupport is a safe place online to talk about depression, anxiety, suicidal thoughts, eating disorders, self-harm, addictions or anything else that\'s hard. Catch the IRL stream talking about these kinds of issues at twitch.tv/heartsupport - MORE INFO: www.heartsupport.com';
  } else if (message.indexOf('!win ') === 0) {
    return addVoteAndReportResult(user.username, WIN_CATEGORY, message);
  } else if (message === '!wins') {
    return getVoteResults(WIN_CATEGORY);
  } else if (message.indexOf('!interview ') === 0) {
    return addVoteAndReportResult(user.username, INTERVIEW_CATEGORY, message);
  } else if (message === '!interviews') {
    return getVoteResults(INTERVIEW_CATEGORY);
  }
}

module.exports = {
  getUnpermissionedResponse,
};
