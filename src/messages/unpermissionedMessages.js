const votesDao = require('../votesDao');
const {getStats} = require('../stats');
const {WIN_CATEGORY, INTERVIEW_CATEGORY} = require('../constants');


async function getVoteResults(category) {
  const result = await votesDao.getAllVotes(category);
  const message = result.reduce(
    (a, c) =>
      `${a}\r\n${c.votes} vote${c.votes > 1 ? 's' : ''} for ${c.candidate}.`,
    '',
  );
  return message ? message : 'No votes yet!';
}

function addVoteAndReportResult(username, category, message) {
  return votesDao
    .upsertVote(username, message, category)
    .then(() => getVoteResults(category))
    .catch(() => votesDao
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
      .catch(() => 'Error: votes can only be for players in the tournament. Try "!win alec" instead'));
}

function getUnpermissionedResponse(dirtyMessage, user) {
  const message = dirtyMessage && dirtyMessage.replace(/[^\x20-\x7E]+/g, '');
  if (!message) {
    return;
  }
  if (message === '!twitter') {
    return 'Want to argue about VRD? https://twitter.com/stlvrd';
  } else if (message === '!salt') {
    return 'PJSalt PJSalt PJSalt PJSalt';
  } else if (
    message === '!vrd1' ||
    message === '!vrd2' ||
    message === '!vrd3' ||
    message === '!vrd4' ||
    message === '!archives'
  ) {
    return 'https://docs.google.com/spreadsheets/d/1AdrhWkDX7i9p2rZbEKzDs3nQAhCvcH0LAXZQNwWMsnA/edit#gid=945529176';
  } else if (message.startsWith('!ban')) {
    return 'Any card not banned in Vintage is legal in this format. Restricted cards are legal and encouraged: https://magic.wizards.com/en/game-info/gameplay/rules-and-formats/banned-restricted';
  } else if (
    message === '!bracket' ||
    message === '!record' ||
    message === '!standings' ||
    message === '!challonge'
  ) {
    return 'Standings are visible at https://challonge.com/stlvrd5';
  } else if (
    message === '!vrd5' ||
    message === '!sheet' ||
    message === '!picks' ||
    message === '!decks' ||
    message === '!deck' ||
    message === '!decklist' ||
    message === '!decklists' ||
    message === '!draft'
  ) {
    return 'Spreadsheet with draft picks is at https://bit.ly/37YbewZ';
  } else if (message === '!youtube') {
    return 'Find our VODs on https://www.youtube.com/channel/UCpwS9X2A-5pmo1txhyD7eoA';
  } else if (message === '!gethelp') {
    return 'For someone to talk to please contact http://www.thetrevorproject.org 1 866 488 7386 Crisis Text Line SMS: Text "HERE" to 741-741';
  } else if (message.indexOf('!winning ') === 0) {
    return addVoteAndReportResult(user.username, WIN_CATEGORY, message);
  } else if (message === '!wins') {
    return getVoteResults(WIN_CATEGORY);
  } else if (message.indexOf('!interview ') === 0) {
    return addVoteAndReportResult(user.username, INTERVIEW_CATEGORY, message);
  } else if (message === '!interviews') {
    return getVoteResults(INTERVIEW_CATEGORY);
  } else if (message.indexOf('!pick') === 0) {
    return getStats(message);
  }
}

module.exports = {
  getUnpermissionedResponse,
};
