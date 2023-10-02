/* eslint-disable operator-linebreak */
/* eslint-disable multiline-ternary */
const {
  getValidCards,
  isValidCardName,
  getCardsLike,
  getDfcFromPartialName,
} = require('../daos/oracleDao');
const {
  getStatsForManyCards,
  getStatsForCard,
  getSynergiesForCard,
  getRecentStatsForCard,
  getNumberOfDraftsLegalForCard,
  getTopCards,
} = require('../daos/archivesDao');
const {getDraftsForCard} = require('../daos/draftsDao');

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
    const validCards = await getValidCards(request.body);
    // Translate DFCs
    let dfcSafeCards = request.body;
    if (request.body.length !== validCards.length) {
      const missingCardsHash = {};
      dfcSafeCards = await Promise.all(
        request.body.map(async (requestCard) => {
          if (
            !validCards.find(
              (validCard) =>
                validCard.card.toLowerCase() === requestCard.toLowerCase()
            )
          ) {
            const dfcCard = await getDfcFromPartialName(requestCard);
            if (dfcCard[0]) {
              return dfcCard[0].card;
            }
            missingCardsHash[requestCard] = true;
          }
          return requestCard;
        })
      );
      const missingCards = Object.keys(missingCardsHash);
      if (missingCards.length) {
        throw {
          message: `Invalid full card names: ${missingCards.join(', ')}`,
        };
      }
    }
    const cardStats = await getStatsForManyCards(dfcSafeCards);
    if (dfcSafeCards.length !== cardStats.length) {
      const missingCards = dfcSafeCards.filter(
        (requestCard) =>
          !cardStats.find(
            (cardStat) =>
              cardStat.card.toLowerCase() === requestCard.toLowerCase()
          )
      );
      missingCards.forEach((missing) => {
        cardStats.push({
          card: missing,
          averageRound: null,
          average: null,
          numberAvailable: null,
          numberTaken: null,
          ratio: null,
          lotusScore: null,
        });
      });
    }
    return cardStats.sort((a, b) => {
      if (a.average > b.average) {
        return 1;
      }
      return -1;
    });
  },
  getTopCards: async () => {
    const topCards = await getTopCards();
    return topCards.map((c, i) => ({...c, overallPick: i}));
  },
};

module.exports = cards;
