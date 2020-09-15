export function strip(number) { // fixing some floating point arithmetic problems
    const bigNum = 1000000
    return Math.round(number*bigNum)/bigNum
}

// TODO: move onto type
export function widthSum(bars) {
    return bars.reduce((acc, curr) => { return acc + curr.width }, 0)
}

export class MockFetcher {
    constructor(routes) {
        this.routes = routes
    }

    async fetch(method, url) {
        // TODO: use an efficient lookup (who really cares though?)
        for (let i = 0; i < this.routes.length; i++) {
            const route = this.routes[i];
            if (method == route.method && url == route.url) {
                console.log(route.result)
                return route.result
            }
        }
    }
}

export class Fetcher {
    async fetch(method, url) {
        let response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        })

        const json = await response.json()
        return json
    }
}