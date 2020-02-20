function getCommandParams(message) {
  const index = message.indexOf(' ');
  return index === -1 ? null : message.substr(index + 1);
}

function isPermissioned(user) {
  const isOwner = user.username === (process.env.CHANNEL || 'stlotusmtg');
  return user.mod || isOwner;
}

module.exports = {
  getCommandParams,
  isPermissioned,
};
