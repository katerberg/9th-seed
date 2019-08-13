const {getCommandParams} = require('./utils');
const {getStatsForCard} = require('./archivesDao');

async function getStats(message) {
  const card = getCommandParams(message);
  const [result] = await getStatsForCard(card);
  if (result) {
    const roundedAverage = Math.round(result.average * 10) / 10;
    const pickRound = Math.ceil(roundedAverage / 8);
    return `${card} has been picked ${result.numberTaken} times (of 13) at pick ${roundedAverage} (round ${pickRound}) on average`;
  }
  return `Sorry, I couldn't find ${card}. Make sure it's the exact spelling`;
}

module.exports = {
  getStats,
};
