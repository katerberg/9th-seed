const {getCard, getCardSynergies, postCards} = require('./cards');
const routes = {
  get: {
    '/test': async () => ({hello: 'world'}),
    '/cards/:cardName': getCard,
    '/cards/:cardName/synergies': getCardSynergies,
  },
  post: {
    '/cards': postCards,
  },
};

module.exports = routes;
