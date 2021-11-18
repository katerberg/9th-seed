const fs = require('fs');
const util = require('util');
const stringify = require('csv-stringify');

fs.readFileAsync = util.promisify(fs.readFile);
fs.writeFileAsync = util.promisify(fs.writeFile);
const stringifyAsync = util.promisify(stringify);

function isNormalSet(type) {
  return ['expansion', 'core', 'commander', 'starter'].includes(type);
}

function getEarliestReleaseDate(allSets, setsForCard) {
  if (setsForCard.some(s => isNormalSet(allSets[s].type))) {
    return setsForCard.reduce((a, c) => {
      if (!isNormalSet(allSets[c].type)) {
        return a;
      }
      if (a < allSets[c].releaseDate) {
        return a;
      }
      return allSets[c].releaseDate;
    }, '2222-11-11');
  }
  return setsForCard.reduce((a, c) => {
    if (allSets[c].type === 'promo') {
      return a;
    }
    if (a < allSets[c].releaseDate) {
      return a;
    }
    return allSets[c].releaseDate;
  }, '2222-11-11');
}

fs.readFileAsync(`${process.cwd()}/setup/SetList.json`, 'utf-8').then((setListText) => {
  const sets = {};
  JSON.parse(setListText).data.forEach(set => {
    sets[set.code] = {
      name: set.name,
      releaseDate: set.releaseDate,
      type: set.type,
    };
  });

  fs.readFileAsync(`${process.cwd()}/setup/VintageCards.json`, 'utf-8').then((textFile) => {
    const cardJson = JSON.parse(textFile).data;
    const cards = Object.keys(cardJson).filter(c => cardJson[c][0].printings);
    stringifyAsync(cards.map(c => [c, getEarliestReleaseDate(sets, cardJson[c][0].printings)])).then((output) => {
      fs.writeFile(`${process.cwd()}/setup/AllCards.csv`, output, (err) => {
        if (err) {
          throw err;
        }
      });
    }).catch((e) => {
      console.log('There was an error writing csv');
      console.log(e);
    });
  }).catch((e) => {
    console.log('There was an error reading VintageCards.json');
    console.log(e);
  });
}).catch((e) => {
  console.log('There was an error reading setlist.json');
  console.log(e);
});
