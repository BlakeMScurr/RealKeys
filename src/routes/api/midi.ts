const path = require('path');
import { midiLocation } from '../../lib/util.ts'

export function get(request, response) {
    console.log("why is this not being called")
    let p = path.resolve(midiLocation + request.query.path)
    console.log(p)
    console.log("asdfasdf")
    response.sendFile(p)
}