-- ###################################################
-- migrate:up
-- ###################################################
--
-- Event
CREATE TABLE IF NOT EXISTS event (
  user_alias_id UUID,
  name String,
  timestamp DateTime,
) ENGINE = MergeTree
ORDER BY
  (user_alias_id, event, timestamp);

--
-- ###################################################
-- migrate:down
-- ###################################################
--
DROP TABLE IF EXISTS event;
