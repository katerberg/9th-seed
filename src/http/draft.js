const {getCsvSheet, cleanEmptyRows} = require('../apis/googleApi');
const {getMultipleCardStats} = require('../helpers/bulkCard');

const draft = {
  getBreakdown: async (request) => {
    const {draftUrl} = request.params;

    if (
      !draftUrl ||
      !/^https:\/\/docs.google.com\/spreadsheets\/d\/[\d\w-]+\/edit(\?gid=\d+(#gid=\d+)?)?$/.test(
        draftUrl
      )
    ) {
      throw {
        statusCode: 400,
        message:
          'Invalid draftUrl: expected format of https://docs.google.com/spreadsheets/d/1yHAVTi7N8n42lvQirCX2j7VBgTUNADx4Lcfv-Aq027s/edit',
      };
    }
    const rows = await getCsvSheet(draftUrl);
    const sheetPerRound = cleanEmptyRows(rows);
    const numberOfPlayers = Object.keys(sheetPerRound[0]).length;
    const cardPicksPerPlayer = sheetPerRound.reduce(
      (a, c) => {
        Object.values(c)
          .filter((card) => card)
          .forEach((v, i) => {
            a[i].push(`${v}`.toLowerCase());
          });
        return a;
      },
      Array.from({length: numberOfPlayers}, () => [])
    );
    const pickStatsPerPlayer = await Promise.all(
      cardPicksPerPlayer.map((picks) => getMultipleCardStats(picks))
    );

    return {
      response: {
        url: draftUrl,
        numberOfPlayers,
        currentRound: sheetPerRound.length,
        pickStatsPerPlayer,
      },
    };
  },
};

module.exports = draft;
