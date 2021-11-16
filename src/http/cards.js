const {isValidCardName} = require('../daos/oracleDao');

const cards = {
  getCards: async(request) => {
    const isValid = await isValidCardName(request.params.cardName);

    return {isValid};
  },
};

module.exports = cards;
