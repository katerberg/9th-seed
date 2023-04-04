/* eslint-disable operator-linebreak */
/* eslint-disable multiline-ternary */
const {isValidCardName} = require('../daos/oracleDao');
const {
  getStatsForManyCards,
  getStatsForCard,
  getSynergiesForCard,
  getRecentStatsForCard,
} = require('../daos/archivesDao');

const NUMBER_OF_ROUNDS = 8;

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

async function validateCard(cardName) {
  const isValid = await isValidCardName(cardName);
  if (!isValid) {
    const stats = await fuzzyMatch(cardName);

    throw {statusCode: 404, message: stats ? stats.card : null};
  }
  return isValid;
}

const cards = {
  getCard: async (request) => {
    const {cardName} = request.params;
    await validateCard(cardName);

    const isPremierDraftFilter =
      request.query && request.query.premier !== undefined;

    const [stats] = await (isPremierDraftFilter
      ? getRecentStatsForCard(cardName)
      : getStatsForCard(cardName));
    if (
      !stats ||
      `${stats.card}`.toLowerCase() !== `${cardName}`.toLowerCase()
    ) {
      const fuzz = await fuzzyMatch(cardName);

      return {
        ...stats,
        card: cardName,
        numberTaken: 0,
        averageRound: null,
        suggestion: fuzz ? fuzz.card : null,
      };
    }

    return {
      ...stats,
      averageRound: stats ? Math.ceil(stats.average / NUMBER_OF_ROUNDS) : null,
    };
  },
  getCardSynergies: async (request) => {
    const {cardName} = request.params;
    await validateCard(cardName);

    const synergies = await getSynergiesForCard(cardName);
    // find all drafts where the card was picked
    // find all cards picked with it
    // order by which ones were picked most
    // take into account that some cards weren't always available
    return synergies.filter((s) => s.card !== cardName);
  },
  postCards: async (request) => {
    if (typeof request.body !== 'object') {
      throw {statusCode: 400, message: 'Invalid content-type'};
    }
    if (
      !Array.isArray(request.body) ||
      request.body.some((item) => typeof item !== 'string')
    ) {
      throw {statusCode: 400, message: 'Expected string array'};
    }

    const cardStats = await getStatsForManyCards(request.body);
    return cardStats;
  },
};

module.exports = cards;
