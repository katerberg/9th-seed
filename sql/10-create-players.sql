DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS players;

CREATE TABLE players (name VARCHAR(200), shortName VARCHAR(200));
ALTER TABLE players ADD CONSTRAINT players_constraint UNIQUE (shortName);

INSERT INTO players (name, shortName) VALUES ('Naveen Balaji', 'naveen');
INSERT INTO players (name, shortName) VALUES ('John Koines', 'john');
INSERT INTO players (name, shortName) VALUES ('Brent Yard', 'brent');
INSERT INTO players (name, shortName) VALUES ('Eric Levine', 'eric');
INSERT INTO players (name, shortName) VALUES ('Daniel Zielinski', 'daniel');
INSERT INTO players (name, shortName) VALUES ('Vincent Brown', 'vincent');
INSERT INTO players (name, shortName) VALUES ('Stephen Hagan', 'stephen');
INSERT INTO players (name, shortName) VALUES ('Elaine Cao', 'elaine');
