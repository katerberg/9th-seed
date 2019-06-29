function getCommandParams(message) {
  const index = message.indexOf(' ');
  return index === -1 ? null : message.substr(index + 1);
}

function isPermissioned(user) {
  const isOwner = user.username === 'stlvrd';
  return user.mod || isOwner;
}

module.exports = {
  getCommandParams,
  isPermissioned,
};
