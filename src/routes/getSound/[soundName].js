const path = require('path');

export function get(request, response) {
    const { soundName } = request.params;
    let p = path.resolve("assets/sounds/" + soundName)
    response.sendFile(p)
}