const axios = require('axios');
const parse = require('csv-parse/lib/sync');

function csvToPicks(parsedCsv) {
  return parsedCsv
    .filter((r) => r && (r[''] === '' || r[''].match(/\d+/)))
    .reduce(
      (accumulator, currentRow) => [
        ...accumulator,
        ...Object.entries(currentRow)
          .map(([drafter, card]) =>
            !drafter || !card ? '' : card.toLowerCase()
          )
          .filter((c) => c),
      ],
      []
    );
}

function sheetUrlToExportUrl(followingDraft) {
  if (!followingDraft) {
    return '';
  }
  const trimmedFollowingDraft = followingDraft.trim();

  const result = new RegExp(
    'https://docs.google.com/spreadsheets/d/(.*)/edit'
  ).exec(trimmedFollowingDraft);
  if (!result || !result[1]) {
    return '';
  }
  const [, followingDraftId] = result;

  const baseDraftUrl = `https://docs.google.com/spreadsheets/d/${followingDraftId}/export?format=csv`;
  const gid =
    trimmedFollowingDraft.split('#gid=')[1] ||
    trimmedFollowingDraft.split('?gid=')[1];

  return gid ? `${baseDraftUrl}&gid=${gid}` : baseDraftUrl;
}

async function getCsvSheet(googleSheetUrl) {
  const {data} = await axios.get(sheetUrlToExportUrl(googleSheetUrl));
  const records = parse(data, {
    columns: true,
    // eslint-disable-next-line camelcase -- External API
    skip_empty_lines: true,
  });
  return records;
}

function cleanEmptyRows(sheetPerRound) {
  return sheetPerRound
    .filter((r) => !isNaN(Number.parseInt(r[''], 10)))
    .map((round) => ({
      ...round,
      '': undefined,
    }))
    .filter((round) => Object.values(round).some((c) => c));
}

module.exports = {
  sheetUrlToExportUrl,
  csvToPicks,
  getCsvSheet,
  cleanEmptyRows,
};
