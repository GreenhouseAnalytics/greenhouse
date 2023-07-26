-- migrate:up
-- User aliases
-- The user will have an ID automatically generated. And other system identifiers can be aliased to it.
-- For example, you can use alias to tie your system's user ID to the greenhouse user ID.
CREATE TABLE IF NOT EXISTS user_alias (
  id UUID,
  user_id UUID,
  alias String,
  created_at DateTime DEFAULT now(),
  updated_at DateTime DEFAULT now(),
  is_deleted UInt8 DEFAULT 0,
) ENGINE = ReplacingMergeTree(updated_at, is_deleted)
ORDER BY
  alias PRIMARY KEY (alias) SETTINGS clean_deleted_rows = 'Always';

-- migrate:down
DROP TABLE IF EXISTS user_alias;
