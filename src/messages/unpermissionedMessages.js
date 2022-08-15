const {getChallonge, getSheet} = require('../configs');
const {getStats} = require('../stats');

function getUnpermissionedResponse(dirtyMessage) {
  const message = dirtyMessage && dirtyMessage.replace(/[^\x20-\x7E]+/g, '').toLowerCase();
  if (!message) {
    return;
  }
  if (message === '!twitter') {
    return 'Want to argue about VRD? https://twitter.com/stlotusmtg';
  } else if (message === '!salt') {
    return 'PJSalt PJSalt PJSalt PJSalt';
  } else if (
    message === '!vrd1' ||
    message === '!vrd2' ||
    message === '!vrd3' ||
    message === '!vrd4' ||
    message === '!vrd5' ||
    message === '!vrd6' ||
    message === '!vrd7' ||
    message === '!archives'
  ) {
    return 'https://docs.google.com/spreadsheets/d/1AdrhWkDX7i9p2rZbEKzDs3nQAhCvcH0LAXZQNwWMsnA/edit#gid=945529176';
  } else if (message.startsWith('!ban') || message.startsWith('!rules')) {
    return 'Any card not banned in Vintage is legal in this format. Restricted cards are legal and encouraged: https://stlotus.org/build/index.html#/rulings';
  } else if (
    message === '!bracket' ||
    message === '!record' ||
    message === '!standings' ||
    message === '!challonge'
  ) {
    return getChallonge();
  } else if (
    message === '!sheet' ||
    message === '!picks' ||
    message === '!decks' ||
    message === '!deck' ||
    message === '!decklist' ||
    message === '!decklists' ||
    message === '!draft'
  ) {
    return getSheet();
  } else if (message === '!discord') {
    return 'Play your first VRD online at https://discord.gg/nxBPYXn';
  } else if (message === '!youtube') {
    return 'Find our VODs on https://www.youtube.com/channel/UCpwS9X2A-5pmo1txhyD7eoA';
  } else if (message === '!gethelp') {
    return 'For someone to talk to please contact http://www.thetrevorproject.org 1 866 488 7386 Crisis Text Line SMS: Text "HERE" to 741-741';
  } else if (message.startsWith('!pick') || message.startsWith('pick!')) {
    return getStats(message);
  }
}

module.exports = {
  getUnpermissionedResponse,
};
