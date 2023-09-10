const {getCard, getCardSynergies, postCards, getTopCards} = require('./cards');
const routes = {
  get: {
    '/test': async () => ({hello: 'world'}),
    '/cards/:cardName': getCard,
    '/cards/:cardName/synergies': getCardSynergies,
    '/best-cards': getTopCards,
  },
  post: {
    '/cards': postCards,
  },
};

module.exports = routes;
