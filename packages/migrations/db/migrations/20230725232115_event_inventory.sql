-- ###################################################
-- migrate:up
-- ###################################################
--
-- Holds a list of unique events and the last time they were inserted
CREATE TABLE IF NOT EXISTS event_inventory (
  name String COMMENT 'The event name',
  timestamp DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree
ORDER BY
  (name);

--
-- ###################################################
-- migrate:down
-- ###################################################
--
DROP TABLE IF EXISTS event_inventory;
