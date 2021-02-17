import { makeTraditionalSequentialCurriculum } from "./curriculum";

export function defaultLessons() {
    makeTraditionalSequentialCurriculum([
        ["Mary Had A Little Lamb", [[1, 5, 9], [1, 9]]],
        ["Alouette", [[1, 3, 5], [1, 5]]],
        ["Chopsticks", [[1,5,9,13,17], [1,9,17], [1,17]]],
        ["Twinkle Twinkle Little Star", [[1,5,9,13], [1,13]]],
        ["Yankee Doodle", [[1,5,9],[1,9]]],
        ["The Muffin Man", [[1,5,9],[1,9]]],
        ["Jingle Bells", [[1,5,9,13,17], [1,9,17], [1,17]]],
        ["Row Row Row Your Boat", [[1,3,5], [1,5]]], // 8ve RH range, but otherwise easy
        ["Piano Man", [[1, 5, 9, 15], [1, 15]]], // Hard rhythm
        ["Ode to Joy", [[1,5,9,13,17], [1,9,17], [1,17]]], // 6th range LH, melody crossover
        ["Baa Baa Black Sheep", [[1,5,9], [1,9]]], // 1 8ve RH range
        ["Silent Night", [[1, 9, 17, 24], [1, 24]]],
    ])
}
