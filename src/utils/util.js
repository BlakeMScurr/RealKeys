export function strip(number) { // fixing some floating point arithmetic problems
    const bigNum = 1000000
    return Math.round(number*bigNum)/bigNum
}

// TODO: move onto type
export function widthSum(bars) {
    return bars.reduce((acc, curr) => { return acc + curr.width }, 0)
}