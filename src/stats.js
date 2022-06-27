const {getCommandParams} = require('./utils');
const {getNumberOfDraftsLegalForCard, getStatsForCard} = require('./daos/archivesDao');
const {isValidCardName} = require('./daos/oracleDao');

async function getMessage(card, numberTaken, average) {
  let numberOfDrafts;
  try {
    const [results] = await getNumberOfDraftsLegalForCard(card);
    ({numberOfDrafts} = results);
  } catch (e) {
    console.error('Error getting number of drafts');
    console.error(e);
  }
  const roundedAverage = Math.round(average * 10) / 10;
  const pickRound = Math.ceil(roundedAverage / 8);
  return `${card} has been picked ${numberTaken} time${numberTaken > 1 ? 's' : ''} (of ${numberTaken > numberOfDrafts ? numberTaken : numberOfDrafts} legal) at pick ${roundedAverage} (round ${pickRound})${numberTaken > 1 ? ' on average' : ''}`;
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
        const message = await getMessage(result.card, result.numberTaken, result.average);
        return `"${card}" isn't a full card name. ${message}`;
      }
      return getMessage(card, result.numberTaken, result.average);
    }
    return `${card} has not been picked yet. Are you sure it's playable?`;

  }
  const fuzzyResult = await fuzzyMatch(card);
  if (fuzzyResult) {
    const message = await getMessage(fuzzyResult.card, fuzzyResult.numberTaken, fuzzyResult.average);

    if (message.startsWith(card) && message.includes('//')) {
      return message;
    }
    return `"${card}" doesn't exist. ${message}`;
  }


  return `Sorry, I couldn't find ${card}. Please make sure it's the exact spelling`;
}

module.exports = {
  getStats,
};
