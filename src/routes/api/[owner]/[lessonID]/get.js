import { NewPool } from "../../../../backend/db/client.js"
var prep = require('pg-prepared')

export function get(request, response) {
    const { owner, lessonID } = request.params;

    const pool = NewPool()
    let query = prep('SELECT * FROM lesson WHERE LESSON_OWNER=${owner} AND LESSON_NAME=${lessonID}')
    pool.query(query(request.params), (err, res) => {
        pool.end()
        response.send(res.rows[0])
    })
}