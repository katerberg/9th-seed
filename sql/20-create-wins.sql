DROP TABLE wins;
CREATE TABLE wins (username VARCHAR(200), vote VARCHAR(200));
ALTER TABLE wins ADD CONSTRAINT wins_unique_constraint UNIQUE (username);
ALTER TABLE wins ADD CONSTRAINT vote_for_players_constraint FOREIGN KEY players_constraint (vote) REFERENCES players (shortName);
