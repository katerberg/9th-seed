const connection = require('./db');

const lotusScoreSelect =
  'SELECT card, averageRound, average, numberAvailable, numberTaken, ratio, COALESCE(NULLIF (ABS(lotusScore), -lotusScore), 0) as lotusScore from ( ' +
  'SELECT *, ((376-(((withRatio.numberAvailable - withRatio.numberTaken) * 376 + withRatio.average * withRatio.numberTaken) / withRatio.numberAvailable))/376*100) as lotusScore from ( ' +
  'SELECT a.card, a.averageRound, a.average, a.numberAvailable, a.numberTaken, a.numberTaken/a.numberAvailable as ratio from( ' +
  'SELECT archives.card ' +
  ',avg(archives.pick) as average ' +
  ',ceiling(avg(archives.pick)/8) as averageRound ' +
  ',( ' +
  'select count(*) ' +
  'from drafts ' +
  'where oracle.releaseDate ' +
  'BETWEEN "1000-01-01" AND drafts.occurance ' +
  ') as numberAvailable ' +
  ', count(*) as numberTaken ' +
  'FROM archives ' +
  'INNER JOIN oracle on oracle.card = archives.card ' +
  'GROUP BY card ' +
  ') a ' +
  ') withRatio ' +
  ') withLotus ';

const archivesDao = {
  getNumberOfDraftsLegalForCard: async (name) =>
    new Promise((res, rej) => {
      connection.query(
        'SELECT count(drafts.draft) as numberOfDrafts ' +
          'FROM drafts ' +
          'LEFT JOIN oracle on oracle.releaseDate BETWEEN "1000-01-01" AND drafts.occurance ' +
          'WHERE oracle.card LIKE ? ' +
          'GROUP BY oracle.card ' +
          'ORDER BY oracle.card asc;',
        [`${name}%`],
        (err, result) => {
          if (err) {
            console.error(
              `Error retrieving number of drafts legal for ${name}`
            );
            return rej(err);
          }
          res(result);
        }
      );
    }),
  getSynergiesForCard: async (name) =>
    new Promise((res, rej) => {
      connection.query(
        'SELECT card, picksWith, averagePick, picksOfSelection, picksOfSynergyOption, LEAST(availablePicksOfSelection, numberAvailable) as overlapInstances, picksWith/LEAST(picksOfSelection, numberAvailable) as percentageTogether' +
          ' FROM (' +
          '  SELECT groupedPicks.card, picksWith, averagePick, picksOfSelection, picksOfSynergyOption, availablePicksOfSelection, ( ' +
          '      SELECT count(*) ' +
          '      FROM drafts ' +
          '      WHERE oracle.releaseDate ' +
          '      BETWEEN "1000-01-01" AND drafts.occurance ' +
          '  ) AS numberAvailable ' +
          '  FROM (' +
          '    SELECT b.card, count(b.card) as picksWith, (SELECT count(*) ' +
          '      FROM drafts ' +
          '      INNER JOIN archives on archives.draft = drafts.draft' +
          '      INNER JOIN oracle on oracle.card = archives.card' +
          '      WHERE archives.card like ?' +
          '      AND oracle.releaseDate BETWEEN "1000-01-01" AND drafts.occurance' +
          '      ) as availablePicksOfSelection, (SELECT count(card) FROM (archives) WHERE archives.card like ?) as picksOfSelection, (SELECT count(card) FROM (archives) WHERE archives.card = b.card) as picksOfSynergyOption, avg(b.pick) as averagePick FROM archives a' +
          '    INNER JOIN archives b ON a.player = b.player AND a.draft = b.draft' +
          '    WHERE a.card like ?' +
          '    GROUP BY b.card' +
          '    ORDER BY count(b.card) DESC, averagePick ASC' +
          '  ) groupedPicks' +
          '  INNER JOIN oracle on oracle.card = groupedPicks.card' +
          '  WHERE groupedPicks.picksWith > 1' +
          ' ) AS availabledPicks' +
          ' ORDER BY percentageTogether DESC, picksWith DESC, picksOfSynergyOption ASC, averagePick ASC',
        [`${name}%`, `${name}%`, `${name}%`],
        (err, result) => {
          if (err) {
            console.error(`Error retrieving synergies for ${name}`);
            return rej(err);
          }
          res(result);
        }
      );
    }),
  getStatsForCard: async (name) =>
    new Promise((res, rej) => {
      connection.query(
        `${lotusScoreSelect} WHERE card LIKE ? ` +
          'GROUP BY card ' +
          'ORDER BY card asc;',
        [`${name}%`],
        (err, result) => {
          if (err) {
            console.error(`Error retrieving stats for ${name}`);
            return rej(err);
          }
          res(result);
        }
      );
    }),
  getStatsForManyCards: async (cardList) =>
    new Promise((res, rej) => {
      connection.query(
        `${lotusScoreSelect} WHERE card in (?)` +
          'ORDER BY ' +
          'average asc ' +
          ', ' +
          'ratio desc ' +
          ', ' +
          'numberTaken desc;',
        [cardList],
        (err, result) => {
          if (err) {
            console.error('Error retrieving most common cards');
            return rej(err);
          }
          res(result);
        }
      );
    }),
};

module.exports = archivesDao;
