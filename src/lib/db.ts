const { Pool } = require('pg')

export function NewPool() {
    let config = {
        database: "melody"
    }
    if (process.env.NODE_ENV !== 'development') {
        config["user"] = "postgres"
        config["password"] = "newPassword"
    }
    return new Pool(config)
}