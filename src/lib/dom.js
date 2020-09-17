// gives coordinates relative to the top left of the HTML element rather than the window
export function getRelativePosition(x, y, node) {
    var rect = node.getBoundingClientRect();
    return { x: x - rect.left, y: y - rect.top }
}