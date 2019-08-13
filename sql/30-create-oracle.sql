DROP TABLE IF EXISTS oracle;

CREATE TABLE oracle (
  card VARCHAR(200) NOT NULL,
  CONSTRAINT oracle_unique_constraint UNIQUE (card)
);
