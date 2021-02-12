import { NewPool } from "../../lib/db"
import { defaultLessons } from "../../lib/lesson/data"

var prep = require('pg-prepared')

export function get(request, response) {
    const pool = NewPool()
    let params = { progress: JSON.stringify(defaultLessons()) }
    let insertion = prep('INSERT INTO users(progress) VALUES (${progress}) RETURNING id;')
    pool.query(insertion(params), (err, res) => {
        if (err !== undefined) {
            console.warn(err)
        }

        response.json({userID: res.rows[0].id})
    })
}