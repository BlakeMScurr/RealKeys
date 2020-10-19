import { NewPool } from "../../../../backend/db/client.js"
var prep = require('pg-prepared')

export function get(request, response) {
    const pool = NewPool()
    let params = {lessonID: request.params.owner + "/" + request.params.lessonID}
    let lessonQuery = prep('SELECT * FROM lesson WHERE LESSON_NAME=${lessonID}')
    pool.query(lessonQuery(params), (err, res) => {
        if (err !== undefined) {
            throw new Error(err)
        }

        if (res !== undefined) {
            let lesson = res.rows[0]
        
            // TODO: is there a more succinct way of putting this?
            let rollQuery = prep('SELECT notes FROM roll WHERE id = (SELECT MAX(id) FROM roll WHERE LESSON_NAME=${lessonID})')
            pool.query(rollQuery(params), (err, res) => {
                if (err !== undefined) {
                    throw new Error(err)
                }
                if (res == undefined) {
                    console.log(err)
                } else {
                    lesson.notes = res.rows[0]
                    response.send(lesson)
                }
                pool.end()
            })
        } else {
            res.err("could not find lesson")
        }
    })
}