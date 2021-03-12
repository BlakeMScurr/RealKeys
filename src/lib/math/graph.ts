
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
            priorPath.push(node)
            return priorPath
        }

        let path = priorPath.slice()
        path.push(node)

        for (let dep = 0; dep < this.matrix[node].length; dep++) {
            const isDep = this.matrix[node][dep];
            if (isDep) {
                let childCycle = this.cycleFrom(dep, path)
                if (childCycle !== []) {
                    return childCycle
                }
            }
        }

        return []
    }
}

export interface dag {

}