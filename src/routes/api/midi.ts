const path = require('path');
import { midiLocation } from '../../lib/util'

export function get(request, response) {
    let p = path.resolve(midiLocation + request.query.path)
    response.sendFile(p)
}