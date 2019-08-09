DROP TABLE IF EXISTS archives;

CREATE TABLE archives (
  player VARCHAR(200) NOT NULL,
  card VARCHAR(200) NOT NULL,
  draft VARCHAR(200) NOT NULL,
  pick INT NOT NULL
);

ALTER TABLE archives
  ADD CONSTRAINT draft_pick_unique_constraint
  UNIQUE (draft, pick);
ALTER TABLE archives
  ADD CONSTRAINT draft_card_unique_constraint
  UNIQUE (draft, card);

