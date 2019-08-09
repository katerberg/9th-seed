DROP TABLE IF EXISTS votes;
CREATE TABLE votes (
  username VARCHAR(200) NOT NULL,
  candidate VARCHAR(200) NOT NULL,
  category VARCHAR(200) NOT NULL
);
ALTER TABLE votes
  ADD CONSTRAINT votes_unique_constraint
  UNIQUE (username, category);
ALTER TABLE votes
  ADD CONSTRAINT candidate_to_player_fk
  FOREIGN KEY players_constraint (candidate)
  REFERENCES players (shortName);
