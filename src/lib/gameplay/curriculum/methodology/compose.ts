import { curriculum, Curriculum } from "../curriculum";
import type { task } from "../task";

// Compose composes curriculae together into a new curriculum where each follows on from the last
// One must complete the first curriculum to go onto the second etc
// 
// Specifically, if curriculum `b` depends on `a`, then the minimal nodes of `b` all depend on all the maximal nodes of `a`
// Note that there is generally only one maximal node, and it's not clear whether depending on all the maximal nodes will be
// the appropriate thing to do once there is a use case for multiple maximal nodes. 
export function compose(curriculae: Array<Curriculum>):Curriculum {
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
    for (let i = 1; i < curriculae.length; i++) {
        const preceding = curriculae[i-1].maximalTasks();
        const following = curriculae[i].minimalTasks();

        following.forEach((t) => {
            preceding.forEach((dep) => {
                if (!deps.has(t)) deps.set(t, [])
                deps.get(t).push(dep)
            })
        })
    }

    let c = new curriculum(Array.from(tasks.keys()), deps)

    // set scores
    tasks.forEach((score, t) => {
        c.recordScore(t, score)
    })

    return c
}

// dag is a matrix representation of a directed
// node i -> j iff this.matrix[i][j]
export class graph {
    matrix: Array<Array<boolean>>;
    constructor(matrix: Array<Array<boolean>>) {
       this.matrix = matrix
    }

    // return this as a directed acyclic graph if possible, error otherwise
    dag():dag {
        // check for cycles
        // 
        // We're saving our cute round nodely friends from a panopticon. We can only free prisoners who aren't being watched!
        // We raid the panopticon again and again, and if a raid ever fails to free someone, some nodes must be keeping each other captive in a cycle :/
        let liberated = new Array<boolean>(this.matrix.length).fill(false)
        while (!liberated.reduce((a, b) => { return a && b })) {
            let successfulRaid: boolean = false
            // TODO: make this O(n^2) rather than O(n^3) by only trying to liberate nodes whose dependencies were liberated in the last raid
            n:
            for (let node = 0; node < this.matrix.length; node++) {
                for (let potentialCaptor = 0; potentialCaptor < this.matrix.length; potentialCaptor++) {
                    if (!liberated[potentialCaptor] && this.matrix[potentialCaptor][node]) {
                        continue n // this node is captive and cannot be freed :'(
                    }
                }
                // a node is free and the raid succeeded!
                liberated[node] = true
                successfulRaid = true
            }

            // A raid failed!
            // debrief and discover the ring of slavish conspirators
            if (!successfulRaid) {
                let stillCaptive = liberated.map((free, i) => { return free ? i : -1 }).filter((v) => {return v != -1 })
                stillCaptive.forEach((captive) => {
                    let cycle = this.cycleFrom(captive, [captive])
                    if (cycle !== []) {
                        throw new Error(`this graph is not a dag, it has a cycle ${cycle.map((a)=> {return a.toString()}).reduce((a, b) => { return a + " -> " + b})}`)
                    }
                })
                throw new Error("Weird implementation/algorithm bug: we couldn't save anyone from the panopticon, but we couldn't find any captive cycles")
            }
        }

        return this
    }

    cycleFrom(node: number, priorPath: Array<number>):Array<number> {
        if (priorPath.indexOf(node) !== -1) {
            return priorPath
        }

        this.matrix[node].forEach((isDep, dep) => {
            if (isDep) {
                let childPath = priorPath.slice()
                childPath.push(dep)
                let childCycle = this.cycleFrom(dep, childPath)
                if (childCycle !== []) {
                    return childCycle
                }
            }
        })

        return []
    }
}

export interface dag {

}