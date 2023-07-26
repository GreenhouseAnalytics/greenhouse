-- ###################################################
-- migrate:up
-- ###################################################
-- Tracks the last time a user property was changed.
-- This is used when deciding how to merge properties between two users:
-- By default, the newest property is kept when merging. Except when both properties are marked as "once", the oldest one is used.
CREATE TABLE IF NOT EXISTS user_property_time (
  user_id UUID,
  property String,
  type Enum('normal', 'once') DEFAULT 'normal',
  timestamp DateTime DEFAULT now(),
) ENGINE = ReplacingMergeTree(timestamp)
ORDER BY
  (user_id, property);

--
-- ###################################################
-- migrate:down
-- ###################################################
--
DROP TABLE IF EXISTS user_property_time;
