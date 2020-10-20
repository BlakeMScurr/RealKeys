import { NewPool } from "../../backend/db/client.js"
var prep = require('pg-prepared')

export function get(request, response) {
    const pool = NewPool()
    let params = {lessonID: request.params.owner + "/" + request.params.lessonID}
    let lessonQuery = prep('SELECT * FROM lesson')
    pool.query(lessonQuery(params), (err, res) => {
        if (err !== undefined) {
            throw new Error(err)
        }

        console.log(res)
        if (res !== undefined) {
            response.send(res.rows)
        }
    })
}