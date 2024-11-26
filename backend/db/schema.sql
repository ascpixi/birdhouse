-- SQL schema for Birdhouse, compatible with MySQL
BEGIN;

CREATE TABLE bh_users (
    id              INT         PRIMARY KEY AUTO_INCREMENT,
    handle          TEXT        UNIQUE NOT NULL,
    display_name    TEXT        NOT NULL,
    bio             TEXT        NOT NULL,
    banner          TEXT        NOT NULL,
    avatar          TEXT        NOT NULL,
    created_on      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pwd_hash        TEXT        NOT NULL
);

CREATE TABLE bh_follows (
    follower_id INT     NOT NULL,
    user_id     INT     NOT NULL,

    PRIMARY KEY (follower_id, user_id),
    FOREIGN KEY (follower_id) REFERENCES bh_users(id),
    FOREIGN KEY (user_id)     REFERENCES bh_users(id)
);

CREATE TABLE bh_posts (
    id              INT             PRIMARY KEY AUTO_INCREMENT,
    author_id       INT             NOT NULL,
    text_content    TEXT            NOT NULL,
    media           TEXT,
    created_on      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reply_to        INT,
    num_likes       INT UNSIGNED    NOT NULL,  -- denormalized field from bh_interactions
    num_reposts     INT UNSIGNED    NOT NULL,  -- denormalized field from bh_interactions
    num_replies     INT UNSIGNED    NOT NULL,  -- denormalized field from bh_posts

    FOREIGN KEY (author_id) REFERENCES bh_users(id),
    FOREIGN KEY (reply_to)  REFERENCES bh_posts(id)
);

CREATE TABLE bh_interactions (
    user_id     INT                     NOT NULL,
    post_id     INT                     NOT NULL,
    kind        ENUM('like', 'repost')  NOT NULL,
    created_on  TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, post_id, kind),
    FOREIGN KEY (user_id) REFERENCES bh_users(id),
    FOREIGN KEY (post_id) REFERENCES bh_posts(id),

    UNIQUE (user_id, post_id, kind)
);

CREATE TABLE bh_sessions (
    token       VARCHAR(36)     PRIMARY KEY,
    user_id     INT             NOT NULL,
    expires     TIMESTAMP       NOT NULL
);

COMMIT;