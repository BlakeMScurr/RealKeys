import type { curriculum } from "./curriculum";
import { PieceBreakdown, SequentialCurriculum } from "./methodology";

export function defaultLessons():curriculum {
    return new SequentialCurriculum([
        new PieceBreakdown("Mary Had A Little Lamb", [[1, 5, 9], [1, 9]]),
        new PieceBreakdown("Alouette", [[1, 3, 5], [1, 5]]),
        new PieceBreakdown("Chopsticks", [[1,5,9,13,17], [1,9,17], [1,17]]),
        new PieceBreakdown("Twinkle Twinkle Little Star", [[1,5,9,13], [1,13]]),
        new PieceBreakdown("Yankee Doodle", [[1,5,9],[1,9]]),
        new PieceBreakdown("The Muffin Man", [[1,5,9],[1,9]]),
        new PieceBreakdown("Jingle Bells", [[1,5,9,13,17], [1,9,17], [1,17]]),
        new PieceBreakdown("Row Row Row Your Boat", [[1,3,5], [1,5]]), // 8ve RH range, but otherwise easy
        new PieceBreakdown("Piano Man", [[1, 5, 9, 15], [1, 15]]), // Hard rhythm
        new PieceBreakdown("Ode to Joy", [[1,5,9,13,17], [1,9,17], [1,17]]), // 6th range LH, melody crossover
        new PieceBreakdown("Baa Baa Black Sheep", [[1,5,9], [1,9]]), // 1 8ve RH range
        new PieceBreakdown("Silent Night", [[1, 9, 17, 24], [1, 24]]),
    ]).curriculum()
}
