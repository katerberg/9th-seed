const connection = require('./db');

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
};

module.exports = draftsDao;
