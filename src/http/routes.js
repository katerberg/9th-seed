const {getCard, postCards} = require('./cards');
const routes = {
  get: {
    '/test': async() => ({hello: 'world'}),
    '/cards/:cardName': getCard,
  },
  post: {
    '/cards': postCards,
  },
};

module.exports = routes;
