const fs = require('fs');
const stringify = require('csv-stringify');
const streamDataEntries = require('./streamDataEntries');

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

const sets = {};
JSON.parse(
  fs.readFileSync(`${process.cwd()}/setup/SetList.json`, 'utf-8')
).data.forEach((set) => {
  sets[set.code] = {
    name: set.name,
    releaseDate: set.releaseDate,
    type: set.type,
  };
});

// AtomicCards.json is too large to JSON.parse in one go on memory-constrained
// machines (the process gets OOM-killed), so stream it entry by entry.
const csv = stringify();
const out = fs.createWriteStream(`${process.cwd()}/setup/AllCards.csv`);
csv.pipe(out);

streamDataEntries(`${process.cwd()}/setup/VintageCards.json`, (name, faces) => {
  const card = faces[0];
  if (!card.printings) {
    return;
  }
  csv.write([
    name,
    getEarliestReleaseDate(sets, card.printings),
    card.colorIdentity.map((ci) => ci.toUpperCase()).join(''),
    card.manaValue,
    card.manaCost,
    card.types.join(';'),
  ]);
})
  .then(() => csv.end())
  .catch((e) => {
    console.log('There was an error reading VintageCards.json');
    console.log(e);
    process.exitCode = 1;
    csv.end();
  });

out.on('error', (e) => {
  console.log('There was an error writing csv');
  console.log(e);
  process.exitCode = 1;
});
