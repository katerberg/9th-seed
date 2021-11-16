const {getCommandParams, isPermissioned} = require('../utils');

function getModResponse(message, user) {
  if (isPermissioned(user)) {
    if (message.indexOf('!so') === 0 || message.indexOf('!shoutout') === 0) {
      const shoutout = getCommandParams(message);
      return shoutout ? `Check out http://twitch.tv/${shoutout} for some really cool content!` : null;
    }
  }

  return null;
}

module.exports = {
  getModResponse,
};
