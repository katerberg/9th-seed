const {getCard, getCards} = require('./cards');
const routes = {
  get: {
    '/test': async() => ({hello: 'world'}),
    '/cards': getCards,
    '/cards/:cardName': getCard,
  },
};

module.exports = routes;
