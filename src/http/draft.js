const {getCsvSheet, cleanEmptyRows} = require('../apis/googleApi');

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

    return {
      response: {
        url: draftUrl,
        currentRound: sheetPerRound.length,
        sheetPerRound,
      },
    };
  },
};

module.exports = draft;
