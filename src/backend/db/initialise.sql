CREATE TABLE IF NOT EXISTS lesson (
   LESSON_OWNER text NOT NULL,
   LESSON_NAME text NOT NULL,
   YOUTUBE_ID text NOT NULL,
   YOUTUBE_TITLE text NOT NULL,
   -- TODO: don't use json for a complex datatype, it seems error prone
   BARS json,
   UNIQUE(LESSON_OWNER, LESSON_NAME)
);