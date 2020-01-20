DROP TABLE IF EXISTS archives;

CREATE TABLE archives (
  player VARCHAR(200) NOT NULL,
  card VARCHAR(200) NOT NULL,
  draft VARCHAR(200) NOT NULL,
  pick INT NOT NULL,
  CONSTRAINT draft_pick_unique_constraint UNIQUE (draft, pick),
  CONSTRAINT draft_card_unique_constraint UNIQUE (draft, card)
);

ALTER TABLE archives
  ADD FOREIGN KEY (card) REFERENCES oracle(card);
ALTER TABLE archives
  ADD FOREIGN KEY (draft) REFERENCES drafts(draft);
