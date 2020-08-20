const path = require('path');

export function get(request, response) {
    const { soundName } = request.params;
    switch (soundName) {
        case "tick":
            let p = path.resolve("assets/sounds/tick.mp3")
            console.log(p)
            response.sendFile(p)
    }
}