const {getStatsForManyCards} = require('../daos/archivesDao');
const {getValidCards, getDfcFromPartialName} = require('../daos/oracleDao');

async function getMultipleCardStats(cardList) {
  const validCards = await getValidCards(cardList);
  // Translate DFCs
  let dfcSafeCards = cardList;
  if (cardList.length !== validCards.length) {
    const missingCardsHash = {};
    dfcSafeCards = await Promise.all(
      cardList.map(async (requestCard) => {
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
      console.log('oh no missing cards', missingCards);
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
        manaValue: null,
        manaCost: null,
        types: null,
      });
    });
  }
  return cardStats;
}

module.exports = {
  getMultipleCardStats,
};
