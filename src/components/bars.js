// takes a set of 
export function even(barlines) {
    return barlines.map((bar) => {
        return {
            type: bar,
            length: 1 / (barlines.length - 1)
        }
    })
}