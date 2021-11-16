const {isValidCardName} = require('../daos/oracleDao');
const {getMostCommonCards, getNumberOfDraftsLegalForCard, getStatsForCard} = require('../daos/archivesDao');

const cards = {
  getCard: async(request) => {
    const {cardName} = request.params;
    const isValid = await isValidCardName(cardName);
    if (!isValid) {
      throw {statusCode: 404, message: 'Invalid card name'};
    }
    const [stats] = await getStatsForCard(cardName);
    const [drafts] = await getNumberOfDraftsLegalForCard(cardName);

    return {...stats, ...drafts};
  },
  getCards: async() => {
    const mostCommon = await getMostCommonCards(50);
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
