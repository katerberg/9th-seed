const fs = require('fs');
const util = require('util');
const stringify = require('csv-stringify');

fs.readFileAsync = util.promisify(fs.readFile);
fs.writeFileAsync = util.promisify(fs.writeFile);
const stringifyAsync = util.promisify(stringify);

function getEarliestReleaseDate(allSets, setsForCard) {
  const bestDate = setsForCard.reduce((a, c) => {
    if (c === 'PRM') { //Promos are BS and never first printing, but since the first promo came out in 2002 it screws everything up
      return a;
    }
    if (a && a < allSets[c].releaseDate) {
      return a;
    }
    return allSets[c].releaseDate;
  }, '2222-11-11');

  return bestDate;
}

fs.readFileAsync(`${process.cwd()}/setup/SetList.json`, 'utf-8').then((setListText) => {
  const sets = {};
  JSON.parse(setListText).forEach(set => {
    sets[set.code] = {
      name: set.name,
      releaseDate: set.releaseDate,
    };
  });

  fs.readFileAsync(`${process.cwd()}/setup/VintageCards.json`, 'utf-8').then((textFile) => {
    const cardJson = JSON.parse(textFile);
    const cards = Object.keys(cardJson);
    stringifyAsync(cards.map(c => [c, getEarliestReleaseDate(sets, cardJson[c].printings)])).then((output) => {
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
    console.log('There was an error reading vintagecards.json');
    console.log(e);
  });
}).catch((e) => {
  console.log('There was an error reading setlist.json');
  console.log(e);
});
