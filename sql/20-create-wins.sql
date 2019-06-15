DROP TABLE votes;
CREATE TABLE votes (username VARCHAR(200), candidate VARCHAR(200), label VARCHAR(200));
ALTER TABLE votes ADD CONSTRAINT wins_unique_constraint UNIQUE (username, label);
ALTER TABLE votes ADD CONSTRAINT candidate_to_player_fk FOREIGN KEY players_constraint (candidate) REFERENCES players (shortName);
