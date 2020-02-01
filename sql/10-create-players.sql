DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS players;

CREATE TABLE players (
  name VARCHAR(200) NOT NULL,
  shortName VARCHAR(200) NOT NULL
);
ALTER TABLE players ADD CONSTRAINT players_constraint UNIQUE (shortName);

INSERT INTO players (name, shortName) VALUES ('Dan Zielinski', 'dan');
INSERT INTO players (name, shortName) VALUES ('Robert Shelli', 'robert');
INSERT INTO players (name, shortName) VALUES ('Vincent Brown', 'vince');
INSERT INTO players (name, shortName) VALUES ('Brandon Curry', 'brandon');
INSERT INTO players (name, shortName) VALUES ('Kyle Vance', 'kyle');
INSERT INTO players (name, shortName) VALUES ('John Ryan Hamilton', 'john');
INSERT INTO players (name, shortName) VALUES ('Naveen Balaji', 'naveen');
INSERT INTO players (name, shortName) VALUES ('Elaine Cao', 'elaine');
