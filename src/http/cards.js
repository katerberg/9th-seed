const {isValidCardName} = require('../daos/oracleDao');

const cards = {
  getCards: async(request) => {
    const isValid = await isValidCardName(request.params.cardName);
    if (!isValid) {
      throw {statusCode: 404, message: 'Invalid card name'};
    }

    return {isValid};
  },
};

module.exports = cards;
