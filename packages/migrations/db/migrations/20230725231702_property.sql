-- ###################################################
-- migrate:up
-- ###################################################
--
-- Maps the full property name to the normalized DB column name
CREATE TABLE IF NOT EXISTS property (
  for Enum('event', 'user') COMMENT 'The table the property should map to',
  name String COMMENT 'The full property name, as submitted by the client',
  column String COMMENT 'The column the property maps to in either the event or user table',
  timestamp DateTime DEFAULT now(),
) ENGINE = ReplacingMergeTree
ORDER BY
  (for, name);

--
-- ###################################################
-- migrate:down
-- ###################################################
--
DROP TABLE IF EXISTS property;
