import { NewPool } from "../../../../backend/db/client.js"
var prep = require('pg-prepared')

export function get(request, response) {
    const pool = NewPool()
    let params = {lessonID: request.params.owner + "/" + request.params.lessonID}
    let query = prep('SELECT * FROM lesson WHERE LESSON_NAME=${lessonID}')
    pool.query(query(params), (err, res) => {
        pool.end()
        response.send(res.rows[0])
    })
}