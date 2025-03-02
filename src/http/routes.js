const {getCard, getCardSynergies, postCards, getTopCards} = require('./cards');
const {getBreakdown} = require('./draft');
const routes = {
  get: {
    '/test': async () => ({hello: 'world'}),
    '/cards/:cardName': getCard,
    '/cards/:cardName/synergies': getCardSynergies,
    '/best-cards': getTopCards,
    '/draft-breakdown/:draftUrl': getBreakdown,
  },
  post: {
    '/cards': postCards,
  },
};

module.exports = routes;
