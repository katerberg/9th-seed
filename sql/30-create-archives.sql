DROP TABLE archives;
CREATE TABLE archives (
  player VARCHAR(200),
  card VARCHAR(200),
  draft VARCHAR(200),
  pick INT
);
ALTER TABLE archives
  ADD CONSTRAINT draft_pick_unique_constraint
  UNIQUE (draft, pick);
ALTER TABLE archives
  ADD CONSTRAINT draft_card_unique_constraint
  UNIQUE (draft, card);

