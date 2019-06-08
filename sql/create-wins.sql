DROP TABLE wins;
CREATE TABLE wins (username VARCHAR(200), vote VARCHAR(200));
ALTER TABLE wins ADD CONSTRAINT wins_unique_constraint UNIQUE (username);
