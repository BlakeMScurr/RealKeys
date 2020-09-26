CREATE TABLE IF NOT EXISTS lesson (
   LESSON_NAME text PRIMARY KEY,
   YOUTUBE_ID text NOT NULL,
   YOUTUBE_TITLE text NOT NULL,
   -- TODO: don't use json for a complex datatype, it seems error prone
   BARS json NOT NULL
);

CREATE SEQUENCE roll_id_seq;

CREATE TABLE IF NOT EXISTS roll (
   -- TODO: have a primary key consisting of version (currently called id) and lesson name, and only increment the version for a new roll for that lesson
   -- This will give a new incrementing number to every new roll, giving us very high numbers, as opposed to the clear 1,2,3 etc version numbers
   -- Guide: https://stackoverflow.com/questions/19060469/sequences-with-composite-primary-key
   id bigint NOT NULL DEFAULT nextval('roll_id_seq'),
   LESSON_NAME text NOT NULL,
   -- TODO: don't use json for a complex datatype, it seems error prone
   NOTES json NOT NULL,
   FOREIGN KEY (LESSON_NAME) REFERENCES lesson (LESSON_NAME),
   unique(id, LESSON_NAME)
);

ALTER SEQUENCE roll_id_seq OWNED BY roll.id;
