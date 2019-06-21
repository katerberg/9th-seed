const {getCommandParams} = require("./utils");

function getModResponse(message, user) {
  const isOwner = user.username === 'stlvrd';
  const isDope = user.mod || isOwner;
  if (isDope) {
    if (message && message.startsWith("!so") || message.startsWith("!shoutout")) {
      return`Check out http://twitch.tv/${getCommandParams(
          message
        )} for some really cool content!`;
    } else if (message === "!clearWins") {
      votesDao.clearAllVotes(WIN_CATEGORY);
      return null;
    }  else if (message === "!clearInterviews") {
      votesDao.clearAllVotes(INTERVIEW_CATEGORY);
      return null;
    }
  }

  return null;
}

module.exports = {
  getModResponse,
};
