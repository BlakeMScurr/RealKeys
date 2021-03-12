
// dag is a matrix representation of a directed
// node i -> j iff this.matrix[i][j]
export class graph {
    private matrix: Array<Array<boolean>>;
    constructor(edges: Array<[number, number]>) {
        let highest = 0
        edges.forEach((edge) => {
            // only allow non negative integers
            if (edge[0] < 0 || Math.floor(edge[0]) !== edge[0] || edge[1] < 0 || Math.floor(edge[1]) !== edge[1]) {
                throw new Error(`edges can only have non negative integers, got edge ${edge[0]} -> ${edge[1]}`)
            }

            if (edge[0] > highest) highest = edge[0]
            if (edge[1] > highest) highest = edge[1]
        })

        // initialise the matrix
        // TODO: could I do this more efficiently and elegantly with fill at the top level too??
        this.matrix = new Array<Array<boolean>>()
        for (let i = 0; i <= highest; i++) {
            this.matrix.push(new Array<boolean>(highest + 1).fill(false))
        }

        edges.forEach(edge => {
            this.matrix[edge[0]][edge[1]] = true
        });
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

    dependsOn(a: number, b: number):boolean {
        if (a >= this.matrix.length || b >= this.matrix.length) {
            throw new Error(`node ${a} and/or ${b} outside range 0->${this.matrix.length-1}`)
        }
        return this.matrix[a][b]
    }
}

export interface dag {
    dependsOn(a: number, b: number):boolean
}