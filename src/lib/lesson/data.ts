import { lesson, difficulty, sections } from "./lesson";

export const lessons: Array<lesson> = [
    new lesson(difficulty.Beginner, "Mary Had a Little Lamb", sections([1, 3, 5])),
    new lesson(difficulty.Beginner, "Twinkle Twinkle Little star", sections([1, 3, 5, 7, 9, 11, 13])),
    new lesson(difficulty.Beginner, "Silent Night", sections([1,5,9,13,17,21,25])),
    new lesson(difficulty.Intermediate, "Fur Elise", sections(Array(8).fill(0).map((_, index) => index * 4 + 1))),
    new lesson(difficulty.Intermediate, "Piano Man", sections(Array(8).fill(0).map((_, index) => index * 4 + 1))),
]

lessons[0].sections[0].hands[0].speeds[0].progress = 100
lessons[0].sections[0].hands[0].speeds[1].progress = 75