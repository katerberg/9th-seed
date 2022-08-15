const {getConfig} = require('./daos/configsDao');

async function getChallonge() {
  const [{stored: challongeUrl}] = await getConfig('challonge');
  return `Standings are visible at ${challongeUrl}`;
}

async function getSheet() {
  const [{stored: sheetUrl}] = await getConfig('sheet');
  return `Follow along on ${sheetUrl}`;
}

module.exports = {
  getChallonge,
  getSheet,
};
