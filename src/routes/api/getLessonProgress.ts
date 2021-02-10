import { NewPool } from "../../lib/db"

var prep = require('pg-prepared')

export function get(request, response) {
    const pool = NewPool()
    let params = { id: request.query.userID }
    let query = prep('SELECT "progress" FROM users WHERE id = ${id}')
    pool.query(query(params), (err, res) => {
        if (err !== undefined) {
            console.warn(err)
        }
        console.log("got", res.rows[0])
        response.json({progress: res.rows[0]})
    })
}