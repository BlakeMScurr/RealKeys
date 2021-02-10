CREATE SEQUENCE userid_seq;

CREATE TABLE users (
   id bigint DEFAULT nextval('userid_seq')
);

ALTER SEQUENCE userid_seq OWNED BY roll.id;