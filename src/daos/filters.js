const PREMIER_FILTER =
  '(drafts.occurrence > DATE_ADD(NOW(), INTERVAL -2 YEAR))';

module.exports = {PREMIER_FILTER};
