const { Pool } = require('pg')

export function NewPool() {
    return  new Pool({database: "melody"})
}