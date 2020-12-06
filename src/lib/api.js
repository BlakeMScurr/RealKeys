import { joinURL } from "./util.ts"

export async function getLessonDefinition(owner, lessonID) {
    let res = await fetch(joinURL(["api", owner, lessonID, "get"]), {
        method: "GET",
    })
    return await res.json()
}
