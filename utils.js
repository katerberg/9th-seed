function getCommandParams(message) {
  return message.substr(message.indexOf(" ") + 1);
}

module.exports = {
  getCommandParams
};
