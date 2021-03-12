
// dag is a matrix representation of a directed
// node i -> j iff this.matrix[i][j]
export class graph {
    matrix: Array<Array<boolean>>;
    constructor(matrix: Array<Array<boolean>>) {
       this.matrix = matrix
    }

    // return this as a directed acyclic graph if possible, error otherwise
    dag():dag {
        // TODO: ressurect the rube goldberg-esque panopticon algorithm if this turns out to be prohibitively inefficient (just trace this comment)
        this.matrix.forEach((_, node) => {
            let cycle = this.cycleFrom(node, [])
            if (cycle.length > 0) {
                throw new Error(`this graph is not a dag, it has a cycle ${cycle.join(" -> ")}`)
            }
        })

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