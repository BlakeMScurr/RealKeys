const path = require('path');
import { midiLocation } from '../../lib/util.ts'

export function get(request, response) {
    let p = path.resolve(midiLocation + request.query.path)
    response.sendFile(p)
}