const {isValidCardName} = require('../daos/oracleDao');
const {getMostCommonCards, getStatsForManyCards, getNumberOfDraftsLegalForCard, getStatsForCard} = require('../daos/archivesDao');

const NUMBER_OF_ROUNDS = 8;

const cards = {
  getCard: async(request) => {
    const {cardName} = request.params;
    const isValid = await isValidCardName(cardName);
    if (!isValid) {
      throw {statusCode: 404, message: 'Invalid card name'};
    }
    const [stats] = await getStatsForCard(cardName);
    const [drafts] = await getNumberOfDraftsLegalForCard(cardName);

    return {...stats, ...drafts, averageRound: stats ? Math.ceil(stats.average / NUMBER_OF_ROUNDS) : null};
  },
  getCards: async(request) => {
    // Freak out if the responses from DB don't match input (due to name mismatch)
    let limit, minRatio;
    try {
      limit = Number.parseInt(request.query.limit, 10);
      if (Number.isNaN(limit) || limit > 1000) {
        limit = undefined;
      }
    } catch (e) {
      console.log('Bad limit provided to getCards. Using default');
      limit = undefined;
    }
    try {
      minRatio = Number.parseInt(request.query['min-ratio'], 10);
      if (Number.isNaN(minRatio) || minRatio > 1 || minRatio < 0) {
        minRatio = undefined;
      }
    } catch (e) {
      console.log('Bad minimum ratio provided to getCards. Using default');
      minRatio = undefined;
    }
    const mostCommon = await getMostCommonCards(minRatio, limit);
    return mostCommon.map(detail =>
      ({
        card: detail.card,
        average: detail.average,
        numberTaken: detail.numberTaken,
        numberOfDrafts: detail.numberAvailable,
        averageRound: detail.averageRound,
        ratio: detail.ratio,
      }),
    );
  },
  postCards: async(request) => {
    if (typeof request.body !== 'object') {
      throw {statusCode: 400, message: 'Invalid content-type'};
    }
    if (!Array.isArray(request.body) || request.body.some(item => typeof item !== 'string')) {
      throw {statusCode: 400, message: 'Expected string array'};
    }

    const cardStats = await getStatsForManyCards(request.body);
    return cardStats;
  },
};

module.exports = cards;