-- ###################################################
-- migrate:up
-- ###################################################
--
-- Event
CREATE TABLE IF NOT EXISTS event (
  user_alias_id UUID,
  name String,
  timestamp DateTime64(3),
) ENGINE = MergeTree
ORDER BY
  (user_alias_id, name, timestamp);

--
-- ###################################################
-- migrate:down
-- ###################################################
--
DROP TABLE IF EXISTS event;
