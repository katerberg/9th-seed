/* eslint-disable operator-linebreak */
/* eslint-disable multiline-ternary */
const {isValidCardName, getCardsLike} = require('../daos/oracleDao');
const {
  getStatsForCard,
  getSynergiesForCard,
  getRecentStatsForCard,
  getNumberOfDraftsLegalForCard,
  getTopCards,
} = require('../daos/archivesDao');
const {getDraftsForCard} = require('../daos/draftsDao');
const {getMultipleCardStats} = require('../helpers/bulkCard');

const NUMBER_OF_ROUNDS = 8;

const findDuplicates = (arr) =>
  arr.filter((item, index) => arr.indexOf(item) !== index);

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

async function fuzzyNameMatch(card) {
  console.log('fuzzy searching ', card);
  if (card.length === 0) {
    return;
  }
  const result = await getCardsLike(card);
  if (result[0]) {
    return result;
  }
  return fuzzyNameMatch(card.slice(0, card.length - 1), getCardsLike);
}

async function validateCard(cardName, statsFunction) {
  const isValid = await isValidCardName(cardName);
  if (!isValid) {
    const stats = await fuzzyMatch(cardName, statsFunction);

    throw {
      statusCode: 404,
      suggestions: await getSuggestions(cardName),
      message: stats ? stats.card : null,
    };
  }
  return isValid;
}

async function getSuggestions(invalidCardName) {
  const fuzz = await fuzzyMatch(invalidCardName, getStatsForCard); // Fuzzy match from VRD
  const exactFuzz = await fuzzyNameMatch(invalidCardName, getStatsForCard); // Fuzzy exact match from non-vrd
  const startingFuzz = await fuzzyNameMatch(
    `${invalidCardName}%`,
    getStatsForCard
  ); // Fuzzy rough starting match from non-vrd
  const looseFuzz = await fuzzyNameMatch(
    `%${invalidCardName}%`,
    getStatsForCard
  ); // Fuzzy rough match from non-vrd
  return [
    ...new Set(
      [
        fuzz ? fuzz.card : '',
        ...(exactFuzz || []).map((fuzzy) => fuzzy.card),
        ...(startingFuzz || []).map((fuzzy) => fuzzy.card),
        ...(looseFuzz || []).map((fuzzy) => fuzzy.card),
      ].filter((a) => a)
    ),
  ].slice(0, 20);
}

const cards = {
  getCard: async (request) => {
    const {cardName} = request.params;

    const isPremierDraftFilter =
      request.query && request.query.premier !== undefined;

    const statsFunction = isPremierDraftFilter
      ? getRecentStatsForCard
      : getStatsForCard;

    await validateCard(cardName, statsFunction);

    const [draftsLegal] = await getNumberOfDraftsLegalForCard(
      cardName,
      isPremierDraftFilter
    );
    const [stats] = await statsFunction(cardName);
    if (
      !stats ||
      `${stats.card}`.toLowerCase() !== `${cardName}`.toLowerCase()
    ) {
      const fuzz = await fuzzyMatch(cardName, statsFunction);

      return {
        ...stats,
        card: cardName,
        numberTaken: 0,
        numberAvailable: draftsLegal.numberOfDrafts,
        averageRound: null,
        suggestion: fuzz ? fuzz.card : null,
        suggestions: await getSuggestions(cardName),
      };
    }

    const drafts = await getDraftsForCard(cardName, isPremierDraftFilter);

    return {
      ...stats,
      drafts: drafts.map((d) => ({...d, occurance: d.occurrence})),
      averageRound: stats ? Math.ceil(stats.average / NUMBER_OF_ROUNDS) : null,
    };
  },
  getCardSynergies: async (request) => {
    const {cardName} = request.params;
    await validateCard(cardName, getStatsForCard);

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
      request.body.length === 0 ||
      request.body.some((item) => typeof item !== 'string')
    ) {
      throw {statusCode: 400, message: 'Expected string array'};
    }

    const duplicates = [...new Set(findDuplicates(request.body))];
    if (duplicates.length) {
      throw {
        message: `Duplicate cards: ${duplicates.toString()}`,
      };
    }
    const cardStats = await getMultipleCardStats(request.body);
    return cardStats.sort((a, b) => {
      if (a.average > b.average) {
        return 1;
      }
      return -1;
    });
  },
  getTopCards: async (request) => {
    const colorFilter =
      request.query &&
      request.query.colorAnd !== undefined &&
      request.query.colorAnd;
    let filter = '%';
    // const topColorlessCards = [];
    if (colorFilter) {
      if (typeof colorFilter === 'string') {
        filter = `%${colorFilter}%`;
      } else {
        // BGRUWC
        filter = `${colorFilter.reduce((a, c) => `${a}%${c}`, '%')}%`;
      }

      // if (filter.includes('%c')) {
      //   topColorlessCards = await getTopCards('');
      //   filter = filter.replace('%c', '');
      // }
    }
    const topFilteredCards = await getTopCards(filter === '%c%' ? '' : filter);

    // Remove this eventually but it's how we can do `OR` if we want it some day
    // const uniqueStrings = [];
    // const uniqueCards = [...topColorlessCards, ...topFilteredCards].filter(
    //   (card) => {
    //     if (!uniqueStrings.includes(card.card)) {
    //       uniqueStrings.push(card.card);
    //       return true;
    //     }
    //     return false;
    //   }
    // );
    return topFilteredCards.map((c, i) => ({...c, overallPick: i}));
  },
};

module.exports = cards;
