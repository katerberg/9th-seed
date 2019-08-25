DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS players;

CREATE TABLE players (
  name VARCHAR(200) NOT NULL,
  shortName VARCHAR(200) NOT NULL
);
ALTER TABLE players ADD CONSTRAINT players_constraint UNIQUE (shortName);

INSERT INTO players (name, shortName) VALUES ('Cody Owen', 'cody');
INSERT INTO players (name, shortName) VALUES ('Jeff Blyden', 'jeff');
INSERT INTO players (name, shortName) VALUES ('Kyle Vance', 'kyle');
INSERT INTO players (name, shortName) VALUES ('Brandon Curry', 'brandon');
INSERT INTO players (name, shortName) VALUES ('Joe Wisdom', 'joe');
INSERT INTO players (name, shortName) VALUES ('Alec Dishaw', 'alec');
INSERT INTO players (name, shortName) VALUES ('Stephen Hagan', 'stephen');
INSERT INTO players (name, shortName) VALUES ('Elaine Cao', 'elaine');
