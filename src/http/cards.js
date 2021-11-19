const {isValidCardName} = require('../daos/oracleDao');
const {getMostCommonCards, getNumberOfDraftsLegalForCard, getStatsForCard} = require('../daos/archivesDao');

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

    return {...stats, ...drafts, averageRound: Math.ceil(stats.average / NUMBER_OF_ROUNDS)};
  },
  getCards: async(request) => {
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
    const promises = mostCommon.map(({card}) => ({
      stats: getStatsForCard(card),
      drafts: getNumberOfDraftsLegalForCard(card),
    }));
    const finishedDetails = await Promise.all(promises.reduce((a, c) => {
      a.push(Promise.all([c.stats, c.drafts]));
      return a;
    }, []));
    return finishedDetails.map(detail => {
      const [[stat], [drafts]] = detail;
      return {card: stat.card, average: stat.average, numberTaken: stat.numberTaken, numberOfDrafts: drafts.numberOfDrafts};
    });
  },
};

module.exports = cards;
