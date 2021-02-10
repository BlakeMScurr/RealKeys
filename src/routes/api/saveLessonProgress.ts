import { NewPool } from "../../lib/db"

var prep = require('pg-prepared')

export function post(request, response) {
    console.log("updating to", request.query.userID, request.body)
    const pool = NewPool()
    let params = { id: request.query.userID, progress: request.body }
    let query = prep('UPDATE users SET progress=${progress} WHERE id=${id}')
    pool.query(query(params), (err, res) => {
        if (err !== undefined) {
            console.warn(err)
        }
        response.json({progress: res.rows[0]})
    })
}