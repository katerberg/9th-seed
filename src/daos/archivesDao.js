const connection = require('./db');

const recentLotusScoreSelect =
  'select card, averageround, average, numberavailable, numbertaken, ratio, coalesce(nullif (abs(lotusscore), -lotusscore), 0) as lotusscore from ( ' +
  'select *, ((376-(((withratio.numberavailable - withratio.numbertaken) * 376 + withratio.average * withratio.numbertaken) / withratio.numberavailable))/376*100) as lotusscore from ( ' +
  'select a.card, a.averageround, a.average, a.numberavailable, a.numbertaken, a.numbertaken/a.numberavailable as ratio from( ' +
  'select archives.card ' +
  ',avg(archives.pick) as average ' +
  ',ceiling(avg(archives.pick)/8) as averageround ' +
  ',( ' +
  'select count(*) ' +
  'from drafts ' +
  'where oracle.releasedate ' +
  'between "1000-01-01" and drafts.occurance ' +
  ') as numberavailable ' +
  ', count(*) as numbertaken ' +
  'from archives ' +
  'inner join oracle on oracle.card = archives.card ' +
  'group by card ' +
  ') a ' +
  ') withratio ' +
  ') withlotus ';

const lotusScoreSelect =
  'select card, averageround, average, numberavailable, numbertaken, ratio, coalesce(nullif (abs(lotusscore), -lotusscore), 0) as lotusscore from ( ' +
  'select *, ((376-(((withratio.numberavailable - withratio.numbertaken) * 376 + withratio.average * withratio.numbertaken) / withratio.numberavailable))/376*100) as lotusscore from ( ' +
  'select a.card, a.averageround, a.average, a.numberavailable, a.numbertaken, a.numbertaken/a.numberavailable as ratio from( ' +
  'select archives.card ' +
  ',avg(archives.pick) as average ' +
  ',ceiling(avg(archives.pick)/8) as averageround ' +
  ',( ' +
  'select count(*) ' +
  'from drafts ' +
  'where oracle.releasedate ' +
  'between "1000-01-01" and drafts.occurance ' +
  ') as numberavailable ' +
  ', count(*) as numbertaken ' +
  'from archives ' +
  'inner join oracle on oracle.card = archives.card ' +
  'group by card ' +
  ') a ' +
  ') withratio ' +
  ') withlotus ';

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
  getRecentStatsForCard: async (name) =>
    new Promise((res, rej) => {
      connection.query(
        `${recentLotusScoreSelect} WHERE card LIKE ? ` +
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
