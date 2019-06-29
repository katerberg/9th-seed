const {getCommandParams, isPermissioned} = require('../utils');
const votesDao = require('../votesDao');
const {WIN_CATEGORY, INTERVIEW_CATEGORY} = require('../constants');

function getModResponse(message, user) {
  if (isPermissioned(user)) {
    if (message.indexOf('!so') === 0 || message.indexOf('!shoutout') === 0) {
      const shoutout = getCommandParams(message);
      return shoutout ? `Check out http://twitch.tv/${shoutout} for some really cool content!` : null;
    } else if (message === '!clearWins') {
      votesDao.clearAllVotes(WIN_CATEGORY);
      return null;
    } else if (message === '!clearInterviews') {
      votesDao.clearAllVotes(INTERVIEW_CATEGORY);
      return null;
    }
  }

  return null;
}

module.exports = {
  getModResponse,
};
