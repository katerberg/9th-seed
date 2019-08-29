const {getCommandParams} = require('./utils');
const {getStatsForCard} = require('./archivesDao');
const {isValidCardName} = require('./oracleDao');

function getMessage(card, numberTaken, average) {
  const roundedAverage = Math.round(average * 10) / 10;
  const pickRound = Math.ceil(roundedAverage / 8);
  return `${card} has been picked ${numberTaken} time${numberTaken > 1 ? 's' : ''} (of 13) at pick ${roundedAverage} (round ${pickRound})${numberTaken > 1 ? ' on average' : ''}`;
}

async function fuzzyMatch(card) {
  if (card.length === 0) {
    return;
  }
  const [result] = await getStatsForCard(card);
  if (result) {
    return result;
  }
  return fuzzyMatch(card.slice(0, card.length - 1));

}

async function getStats(message) {
  const card = getCommandParams(message);

  if (await isValidCardName(card)) {
    const [result] = await getStatsForCard(card);
    if (result) {
      if (result.card !== card.toLowerCase()) {
        return `"${card}" isn't a full card name. ${getMessage(result.card, result.numberTaken, result.average)}`;
      }
      return getMessage(card, result.numberTaken, result.average);
    }
    return `${card} has not been picked yet. Are you sure it's playable?`;

  }
  const fuzzyResult = await fuzzyMatch(card);
  if (fuzzyResult) {
    return `"${card}" doesn't exist. ${getMessage(fuzzyResult.card, fuzzyResult.numberTaken, fuzzyResult.average)}`;
  }


  return `Sorry, I couldn't find ${card}. Please make sure it's the exact spelling`;
}

module.exports = {
  getStats,
};
