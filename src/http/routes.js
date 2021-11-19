const {getCard, postCards, getCards} = require('./cards');
const routes = {
  get: {
    '/test': async() => ({hello: 'world'}),
    '/cards': getCards,
    '/cards/:cardName': getCard,
  },
  post: {
    '/cards': postCards,
  },
};

module.exports = routes;
