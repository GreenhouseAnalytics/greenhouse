
--
-- Database schema
--

CREATE DATABASE IF NOT EXISTS greenhouse;

CREATE TABLE greenhouse.event
(
    `user_alias_id` UUID,
    `name` String,
    `timestamp` DateTime
)
ENGINE = MergeTree
ORDER BY (user_alias_id, name, timestamp)
SETTINGS index_granularity = 8192;

CREATE TABLE greenhouse.event_inventory
(
    `name` String COMMENT 'The event name',
    `timestamp` DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree
ORDER BY name
SETTINGS index_granularity = 8192;

CREATE TABLE greenhouse.property
(
    `for` Enum8('event' = 1, 'user' = 2) COMMENT 'The table the property should map to',
    `name` String COMMENT 'The full property name, as submitted by the client',
    `column` String COMMENT 'The column the property maps to in either the event or user table',
    `timestamp` DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree
ORDER BY (for, name)
SETTINGS index_granularity = 8192;

CREATE TABLE greenhouse.property_inventory
(
    `name` String COMMENT 'The full property name',
    `for` Enum8('event' = 1, 'user' = 2) COMMENT 'The table the property is on',
    `event` String COMMENT 'The event it was set on (if applicable)',
    `timestamp` DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree
ORDER BY (for, name, event)
SETTINGS index_granularity = 8192;

CREATE TABLE greenhouse.schema_migrations
(
    `version` String,
    `ts` DateTime DEFAULT now(),
    `applied` UInt8 DEFAULT 1
)
ENGINE = ReplacingMergeTree(ts)
PRIMARY KEY version
ORDER BY version
SETTINGS index_granularity = 8192;

CREATE TABLE greenhouse.user
(
    `id` UUID,
    `created_at` DateTime DEFAULT now(),
    `updated_at` DateTime DEFAULT now(),
    `is_deleted` UInt8 DEFAULT 0
)
ENGINE = ReplacingMergeTree(updated_at, is_deleted)
PRIMARY KEY id
ORDER BY id
SETTINGS clean_deleted_rows = 'Always', index_granularity = 8192;

CREATE TABLE greenhouse.user_alias
(
    `id` UUID,
    `user_id` UUID,
    `alias` String,
    `created_at` DateTime DEFAULT now(),
    `updated_at` DateTime DEFAULT now(),
    `is_deleted` UInt8 DEFAULT 0
)
ENGINE = ReplacingMergeTree(updated_at, is_deleted)
PRIMARY KEY alias
ORDER BY alias
SETTINGS clean_deleted_rows = 'Always', index_granularity = 8192;

CREATE TABLE greenhouse.user_property_time
(
    `user_id` UUID,
    `property` String,
    `type` Enum8('normal' = 1, 'once' = 2) DEFAULT 'normal',
    `timestamp` DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(timestamp)
ORDER BY (user_id, property)
SETTINGS index_granularity = 8192;


--
-- Dbmate schema migrations
--

INSERT INTO schema_migrations (version) VALUES
    ('20230725230732'),
    ('20230725230801'),
    ('20230725231658'),
    ('20230725231702'),
    ('20230725231810'),
    ('20230725232115'),
    ('20230725233843');
