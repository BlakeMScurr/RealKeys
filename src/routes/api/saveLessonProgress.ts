import { NewPool } from "../../lib/db"

var prep = require('pg-prepared')

export function post(request, response) {
    const pool = NewPool()
    let params = { id: request.query.userID, progress: request.body }
    let query = prep('UPDATE users SET progress=${progress} WHERE id=${id}')
    pool.query(query(params), (err, res) => {
        if (err !== undefined) {
            console.warn(err)
        } else {
            response.json({progress: res.rows[0]})
        }
    })
}