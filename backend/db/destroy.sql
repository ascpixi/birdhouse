-- Drops all Birdhouse data from a database.
BEGIN;

DROP TABLE IF EXISTS bh_follows;        -- fkeys: bh_users, bh_users
DROP TABLE IF EXISTS bh_interactions;   -- fkeys: bh_users, bh_posts
DROP TABLE IF EXISTS bh_posts;          -- fkeys: bh_users, bh_posts

DROP TABLE IF EXISTS bh_users;
DROP TABLE IF EXISTS bh_sessions;

COMMIT;