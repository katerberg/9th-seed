const {getCommandParams} = require('./utils');
const {getStatsForCard} = require('./archivesDao');
const {isValidCardName} = require('./oracleDao');

async function getStats(message) {
  const card = getCommandParams(message);
  const [result] = await getStatsForCard(card);
  if (result) {
    const roundedAverage = Math.round(result.average * 10) / 10;
    const pickRound = Math.ceil(roundedAverage / 8);
    return `${card} has been picked ${result.numberTaken} times (of 13) at pick ${roundedAverage} (round ${pickRound}) on average`;
  }
  if (await isValidCardName(card)) {
    return `${card} has not been picked yet. Are you sure it's playable?`;
  }

  return `Sorry, I couldn't find ${card}. Make sure it's the exact spelling`;
}

module.exports = {
  getStats,
};
