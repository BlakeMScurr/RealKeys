import type { dag } from "../../../math/graph";
import { curriculum, Curriculum } from "../curriculum";
import type { task } from "../task";

// Compose composes curriculae together into a new curriculum where each follows on from the last
// One must complete the first curriculum to go onto the second etc
// 
// Specifically, if curriculum `b` depends on `a`, then the minimal nodes of `b` all depend on all the maximal nodes of `a`
// Note that there is generally only one maximal node, and it's not clear whether depending on all the maximal nodes will be
// the appropriate thing to do once there is a use case for multiple maximal nodes. 
export function compose(curriculae: Array<Curriculum>, graph: dag):Curriculum {
    // Copy all of the tasks an dependencies into a new curriculum
    let tasks = new Map<task, number>();
    let deps = new Map<task, Array<task>>();
    curriculae.forEach((c) => {
        c.getTasks().forEach((score, t) => {
            tasks.set(t, score)
        })

        c.getDependencies().forEach((taskDeps, t) => {
            deps.set(t, taskDeps.slice())
        })
    })

    // Link curriculae
    for (let i = 0; i < curriculae.length; i++) {
        for (let j = 0; j < curriculae.length; j++) {
            if (graph.dependsOn(i, j)) {
                const preceding = curriculae[j].maximalTasks();
                const following = curriculae[i].minimalTasks();
    
                following.forEach((t) => {
                    preceding.forEach((dep) => {
                        if (!deps.has(t)) deps.set(t, [])
                        deps.get(t).push(dep)
                    })
                })
            }
        }
    }

    let c = new curriculum(Array.from(tasks.keys()), deps)

    // set scores
    tasks.forEach((score, t) => {
        c.recordScore(t, score)
    })

    return c
}