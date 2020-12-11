var NewPool = require('./client')
var prep = require('pg-prepared')
const pool = NewPool()

let insertion = prep('INSERT INTO library(path) VALUES (${path})')
pool.query(insertion({path: "testdata"}), (err, res) => {
    if (err !== undefined) {
        throw err
    }
    pool.end()
    response.end()
})
