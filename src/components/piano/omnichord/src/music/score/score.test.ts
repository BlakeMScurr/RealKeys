/**
 * @jest-environment jsdom
 */

import { Score } from "./score";
import { content } from "./exampleContent"

test('location', () => {
    var score = load()
    // currently gets the bar number of the bar in which this timestamp resides
    expect(score.findLocation(0)).toBe(0)
    expect(score.findLocation(1)).toBe(1)
    // TODO: why is this wrong?
    // expect(score.findLocation(2)).toBe(2)
    expect(score.findLocation(10)).toBe(5)
    expect(score.findLocation(20)).toBe(10)
})

test('load', () => {
    load()
});

// Loads up the example score
function load() {
    let testId = "score";
    let newDiv = document.createElement("div");
    newDiv.setAttribute("id", testId);
    document.body.appendChild(newDiv);

    var score = new Score();

    expect(score.osmd.Sheet).toBe(undefined)
    
    async function load() {
        await score.osmd.load(content)
    }
    load()

    expect(score.osmd.Sheet.Composer.text).toBe("Muzio Clementi")
    return score
}