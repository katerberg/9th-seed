const {getCommandParams} = require('./utils');
const {getStatsForCard, getRecentStatsForCard} = require('./daos/archivesDao');
const {isValidCardName} = require('./daos/oracleDao');

async function getMessage(card, numberTaken, numberAvailable, average) {
  const numberOfDrafts = numberAvailable;
  const roundedAverage = Math.round(average * 10) / 10;
  const pickRound = Math.ceil(roundedAverage / 8);
  return `${card} has been picked ${numberTaken} time${
    numberTaken > 1 ? 's' : ''
  } (of ${
    numberTaken > numberOfDrafts ? numberTaken : numberOfDrafts
  } legal) at pick ${roundedAverage} (round ${pickRound})${
    numberTaken > 1 ? ' on average' : ''
  }`;
}

async function fuzzyMatch(card, statsFunction) {
  if (card.length === 0) {
    return;
  }
  const [result] = await statsFunction(card);
  if (result) {
    return result;
  }
  return fuzzyMatch(card.slice(0, card.length - 1), statsFunction);
}

async function getRecentStats(message) {
  const card = getCommandParams(message);

  if (await isValidCardName(card)) {
    const [result] = await getRecentStatsForCard(card);
    if (result) {
      return getMessage(
        card,
        result.numberTaken,
        result.numberAvailable,
        result.average
      );
    }
    return `${card} has not been picked recently. Are you sure it's playable?`;
  }
  const fuzzyResult = await fuzzyMatch(card, getRecentStatsForCard);
  if (fuzzyResult) {
    const message = await getMessage(
      fuzzyResult.card,
      fuzzyResult.numberTaken,
      fuzzyResult.numberAvailable,
      fuzzyResult.average
    );

    if (message.startsWith(card) && message.includes('//')) {
      return message;
    }
    return `"${card}" doesn't exist. ${message}`;
  }

  return `Sorry, I couldn't find ${card}. Please make sure it's the exact spelling`;
}

async function getStats(message) {
  const card = getCommandParams(message);

  if (await isValidCardName(card)) {
    const [result] = await getStatsForCard(card);
    if (result) {
      return getMessage(
        card,
        result.numberTaken,
        result.numberAvailable,
        result.average
      );
    }
    return `${card} has not been picked yet. Are you sure it's playable?`;
  }
  const fuzzyResult = await fuzzyMatch(card, getStatsForCard);
  if (fuzzyResult) {
    const message = await getMessage(
      fuzzyResult.card,
      fuzzyResult.numberTaken,
      fuzzyResult.numberAvailable,
      fuzzyResult.average
    );

    if (message.startsWith(card) && message.includes('//')) {
      return message;
    }
    return `"${card}" doesn't exist. ${message}`;
  }

  return `Sorry, I couldn't find ${card}. Please make sure it's the exact spelling`;
}

module.exports = {
  getStats,
  getRecentStats,
};
