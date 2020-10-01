import { NewPool } from "../../../../backend/db/client.js"
var prep = require('pg-prepared')

export function post(request, response) {
    const { owner, lessonID } = request.params;

    if (request.body.lesson_name != owner + "/" + lessonID) {
        throw new Error("inconsistent names: " + request.body.lesson_name + " " + owner + "/" + lessonID)
    } else {
        const pool = NewPool()
        let query = prep("UPDATE lesson SET LESSON_NAME=${lesson_name}, YOUTUBE_ID=${youtube_id}, YOUTUBE_TITLE=${youtube_title}, BARS=${bars} WHERE LESSON_NAME=${lesson_name}")
        request.body.bars = JSON.stringify(request.body.bars)
        pool.query(query(request.body), (err, res) => {
            pool.end()
            if (err !== undefined) {
                throw err
            }
        })
    }
    
}