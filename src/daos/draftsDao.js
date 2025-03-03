const connection = require('./db');
const {PREMIER_FILTER} = require('./filters');

const draftsDao = {
  getDraftsForCard: async (name, premier) =>
    new Promise((res, rej) => {
      connection.query(
        `
SELECT * FROM
  (SELECT archives.card, drafts.draft, drafts.gid, drafts.occurrence as occurrence, archives.pick,
  (SELECT releaseDate FROM oracle WHERE oracle.card = ?) as maxRelease
  FROM drafts
  LEFT JOIN archives ON (
    drafts.draft = archives.draft
    AND archives.card = ?
    OR archives.card IS NULL
  )
  LEFT JOIN oracle on (archives.card = oracle.card OR oracle.card IS NULL)
  ${premier ? `WHERE ${PREMIER_FILTER}` : ''}
  ) a
WHERE a.card IS NOT NULL OR a.occurrence >= a.maxRelease
ORDER BY a.occurrence ASC;
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
