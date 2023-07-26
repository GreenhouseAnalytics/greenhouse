-- ###################################################
-- migrate:up
-- ###################################################
--
-- User
-- The user properties
CREATE TABLE IF NOT EXISTS user (
  id UUID,
  created_at DateTime DEFAULT now(),
  updated_at DateTime DEFAULT now(),
  is_deleted UInt8 DEFAULT 0,
) ENGINE = ReplacingMergeTree(updated_at, is_deleted)
ORDER BY
  id PRIMARY KEY (id) SETTINGS clean_deleted_rows = 'Always';

--
-- ###################################################
-- migrate:down
-- ###################################################
--
DROP TABLE IF EXISTS user;
