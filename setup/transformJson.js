const fs = require('fs');
const util = require('util');
const stringify = require('csv-stringify');
const {chain} = require('stream-chain');
const {parser} = require('stream-json');
const {pick} = require('stream-json/filters/pick.js');
const {streamObject} = require('stream-json/streamers/stream-object.js');

fs.readFileAsync = util.promisify(fs.readFile);
fs.writeFileAsync = util.promisify(fs.writeFile);
const stringifyAsync = util.promisify(stringify);

function isNormalSet(type) {
  return [
    'expansion',
    'core',
    'commander',
    'starter',
    'draft_innovation',
  ].includes(type);
}

function getEarliestReleaseDate(allSets, setsForCard) {
  if (setsForCard.some((s) => isNormalSet(allSets[s] ? allSets[s].type : ''))) {
    return setsForCard.reduce((a, c) => {
      if (!allSets[c] || !isNormalSet(allSets[c].type)) {
        return a;
      }
      if (a < allSets[c].releaseDate) {
        return a;
      }
      return allSets[c].releaseDate;
    }, '2222-11-11');
  }
  return setsForCard.reduce((a, c) => {
    if (
      !allSets[c] ||
      allSets[c].type === 'promo' ||
      a < allSets[c].releaseDate
    ) {
      return a;
    }
    return allSets[c].releaseDate;
  }, '2222-11-11');
}

fs.readFileAsync(`${process.cwd()}/setup/SetList.json`, 'utf-8')
  .then((setListText) => {
    const sets = {};
    JSON.parse(setListText).data.forEach((set) => {
      sets[set.code] = {
        name: set.name,
        releaseDate: set.releaseDate,
        type: set.type,
      };
    });

    // AtomicCards.json is too large to JSON.parse on memory-limited hosts,
    // so stream it one card at a time.
    const rows = [];
    const pipeline = chain([
      fs.createReadStream(`${process.cwd()}/setup/VintageCards.json`),
      parser(),
      pick({filter: 'data'}),
      streamObject(),
    ]);
    pipeline.on('data', ({key, value}) => {
      const card = value[0];
      if (!card.printings) {
        return;
      }
      rows.push([
        key,
        getEarliestReleaseDate(sets, card.printings),
        card.colorIdentity.map((ci) => ci.toUpperCase()).join(''),
        card.manaValue,
        card.manaCost,
        card.types.join(';'),
      ]);
    });
    pipeline.on('error', (e) => {
      console.log('There was an error reading VintageCards.json');
      console.log(e);
      process.exitCode = 1;
    });
    pipeline.on('end', () => {
      stringifyAsync(rows)
        .then((output) =>
          fs.writeFileAsync(`${process.cwd()}/setup/AllCards.csv`, output)
        )
        .catch((e) => {
          console.log('There was an error writing csv');
          console.log(e);
          process.exitCode = 1;
        });
    });
  })
  .catch((e) => {
    console.log('There was an error reading setlist.json');
    console.log(e);
  });
