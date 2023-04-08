const connection = require('./db');
const {PREMIER_FILTER} = require('./filters');

const draftsDao = {
  getDrafts: async () =>
    new Promise((res, rej) => {
      connection.query(
        'SELECT d.draft, d.occurance, exp((d.maxDays - d.daysSinceDraft) / (d.maxDays - d.minDays)) * 2 - 1.9 as weight ' +
          'FROM ( ' +
          '  SELECT drafts.draft' +
          '      , drafts.occurance' +
          '      , DATEDIFF(now(), drafts.occurance) as daysSinceDraft' +
          '      , (select DATEDIFF(now(), min(drafts.occurance)) from drafts) as maxDays' +
          '      , (select DATEDIFF(now(), max(drafts.occurance)) from drafts) as minDays' +
          '  FROM drafts' +
          ') d;',
        (err, result) => {
          if (err) {
            console.error('Error retrieving draft names');
            return rej(err);
          }
          res(result);
        }
      );
    }),
  getDraftsForCard: async (name, premier) =>
    new Promise((res, rej) => {
      connection.query(
        `
SELECT * FROM
  (SELECT archives.card, drafts.draft, drafts.occurance as occurrence, archives.pick,
  (SELECT releaseDate FROM oracle WHERE oracle.card = ?) as maxRelease
  FROM drafts
  LEFT JOIN archives ON (
    drafts.draft = archives.draft
    AND archives.card = ?
    OR archives.card IS NULL
  )
  LEFT JOIN oracle on (archives.card = oracle.card OR oracle.card IS NULL)
  ${premier ? `WHERE ${PREMIER_FILTER}` : ''}
  ORDER BY drafts.occurance ASC) a
WHERE a.occurrence >= a.maxRelease
`,
        [`${name}`, `${name}`],
        (err, result) => {
          if (err) {
            console.error('Error retrieving drafts for card');
            return rej(err);
          }
          res(result);
        }
      );
    }),
};
module.exports = draftsDao;
