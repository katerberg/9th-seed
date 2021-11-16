const {getCards} = require('./cards');
const routes = {
  get: {
    '/test': async() => ({hello: 'world'}),
    '/cards/:cardName': getCards,
  },
};

module.exports = routes;
