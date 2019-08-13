const {getCommandParams} = require('./utils');
const {getNumberOfTimesTaken} = require('./archivesDao');

async function getStats(message) {
  const card = getCommandParams(message);
  const [result] = await getNumberOfTimesTaken(card);
  if (result) {
    return `${card} has been picked ${result.numberTaken} times`;
  }
  return `Sorry, I couldn't find ${card}. Make sure it's the exact spelling`;
}

module.exports = {
  getStats,
};
