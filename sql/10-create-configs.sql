DROP TABLE IF EXISTS configs;

CREATE TABLE configs (
  `config` VARCHAR(200) NOT NULL,
  `stored` VARCHAR(200) NOT NULL,
  CONSTRAINT config_config_unique_constraint UNIQUE (config)
);
