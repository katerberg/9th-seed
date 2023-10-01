const connection = require('./db');
const {PREMIER_FILTER} = require('./filters');

const lotusScoreSelect =
  'SELECT card, averageRound, average, numberAvailable, numberTaken, ratio, COALESCE(NULLIF (ABS(lotusScore), -lotusScore), 0) as lotusScore from ( ' +
  'SELECT *, ((376-(((withRatio.numberAvailable - withRatio.numberTaken) * 376 + withRatio.average * withRatio.numberTaken) / withRatio.numberAvailable))/376*100) as lotusScore from ( ' +
  'SELECT a.card, a.averageRound, a.average, a.numberAvailable, a.numberTaken, a.numberTaken/a.numberAvailable as ratio from( ' +
  'SELECT archives.card ' +
  ',avg(archives.pick) as average ' +
  ',ceiling(avg(archives.pick)/8) as averageRound ' +
  ',GREATEST(( ' +
  'select count(*) ' +
  'from drafts ' +
  'where oracle.releaseDate ' +
  'BETWEEN "1000-01-01" AND drafts.occurrence ' +
  '), count(*)) as numberAvailable ' +
  ', count(*) as numberTaken ' +
  'FROM archives ' +
  'INNER JOIN oracle on oracle.card = archives.card ' +
  'GROUP BY card ' +
  ') a ' +
  ') withRatio ' +
  ') withLotus ';

const recentLotusScoreSelect =
  `SELECT card, averageRound, average, numberAvailable, numberTaken, ratio, COALESCE(NULLIF (ABS(lotusScore), -lotusScore), 0) as lotusScore from ( ` +
  `SELECT *, ((376-(((withRatio.numberAvailable - withRatio.numberTaken) * 376 + withRatio.average * withRatio.numberTaken) / withRatio.numberAvailable))/376*100) as lotusScore from ( ` +
  `SELECT a.card, a.averageRound, a.average, a.numberAvailable, a.numberTaken, a.numberTaken/a.numberAvailable as ratio from( ` +
  `SELECT archives.card ` +
  `,avg(archives.pick) as average ` +
  `,ceiling(avg(archives.pick)/8) as averageRound ` +
  `,GREATEST(( ` +
  `select count(*) ` +
  `from drafts ` +
  `where ${PREMIER_FILTER} ` +
  `AND oracle.releaseDate ` +
  `BETWEEN "1000-01-01" AND drafts.occurrence ` +
  `), count(*)) as numberAvailable ` +
  `, count(*) as numberTaken ` +
  `FROM archives ` +
  `INNER JOIN oracle on oracle.card = archives.card ` +
  `INNER JOIN drafts on drafts.draft = archives.draft ` +
  `WHERE ${PREMIER_FILTER} GROUP BY card ` +
  `) a ` +
  `) withRatio ` +
  `) withLotus `;

const archivesDao = {
  getNumberOfDraftsLegalForCard: async (name, premier) =>
    new Promise((res, rej) => {
      const filter = premier ? ` AND ${PREMIER_FILTER} ` : '';
      connection.query(
        `SELECT count(drafts.draft) as numberOfDrafts ` +
          `FROM drafts ` +
          `LEFT JOIN oracle on oracle.releaseDate BETWEEN "1000-01-01" AND drafts.occurrence ` +
          `WHERE oracle.card LIKE ? ${filter} GROUP BY oracle.card ` +
          `ORDER BY oracle.card asc;`,
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
          '      BETWEEN "1000-01-01" AND drafts.occurrence ' +
          '  ) AS numberAvailable ' +
          '  FROM (' +
          '    SELECT b.card, count(b.card) as picksWith, (SELECT count(*) ' +
          '      FROM drafts ' +
          '      INNER JOIN archives on archives.draft = drafts.draft' +
          '      INNER JOIN oracle on oracle.card = archives.card' +
          '      WHERE archives.card like ?' +
          '      AND oracle.releaseDate BETWEEN "1000-01-01" AND drafts.occurrence' +
          '      ) as availablePicksOfSelection, (SELECT count(card) FROM (archives) WHERE archives.card like ?) as picksOfSelection, (SELECT count(card) FROM (archives) WHERE archives.card = b.card) as picksOfSynergyOption, avg(b.pick) as averagePick FROM archives a' +
          '    INNER JOIN archives b ON a.player = b.player AND a.draft = b.draft' +
          '    WHERE a.card like ?' +
          '    GROUP BY b.card' +
          '    ORDER BY count(b.card) DESC, averagePick ASC' +
          '  ) groupedPicks' +
          '  INNER JOIN oracle on oracle.card = groupedPicks.card' +
          '  WHERE groupedPicks.picksWith > 1' +
          ' ) AS availablePicks' +
          ' ORDER BY percentageTogether DESC, picksWith DESC, picksOfSynergyOption ASC, averagePick ASC' +
          ' LIMIT 200',
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
  getTopCards: async (limit = 1000) =>
    new Promise((res, rej) => {
      connection.query(
        `${recentLotusScoreSelect} ORDER BY lotusScore desc LIMIT ?;`,
        [limit],
        (err, result) => {
          if (err) {
            console.error('Error retrieving top cards');
            return rej(err);
          }
          res(result);
        }
      );
    }),
};

module.exports = archivesDao;
