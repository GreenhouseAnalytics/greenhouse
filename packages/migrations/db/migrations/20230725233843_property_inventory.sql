-- ###################################################
-- migrate:up
-- ###################################################
--
-- Holds a list of unique properties, the event they were used on (if applicable), and the last time they were inserted
CREATE TABLE IF NOT EXISTS property_inventory (
  name String COMMENT 'The full property name',
  for Enum('event', 'user') COMMENT 'The table the property is on',
  event String COMMENT 'The event it was set on (if applicable)',
  timestamp DateTime DEFAULT now(),
) ENGINE = ReplacingMergeTree
ORDER BY
  (for, name, event);

--
-- ###################################################
-- migrate:down
-- ###################################################
--
DROP TABLE IF EXISTS property_inventory;
