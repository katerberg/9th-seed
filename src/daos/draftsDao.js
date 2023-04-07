const connection = require('./db');

const draftsForCardSelect = `
SELECT * FROM
  (SELECT archives.card, drafts.draft, drafts.occurance,
  (SELECT releaseDate FROM oracle WHERE oracle.card = ?) as maxRelease
  FROM drafts
  LEFT JOIN archives ON (
    drafts.draft = archives.draft
    AND archives.card = ?
    OR archives.card IS NULL
  )
  LEFT JOIN oracle on (archives.card = oracle.card OR oracle.card IS NULL)
  ORDER BY drafts.occurance DESC) a
WHERE a.occurance >= a.maxRelease
`;

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
  getDraftsForCard: async (name) =>
    new Promise((res, rej) => {
      connection.query(
        draftsForCardSelect,
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
