import { Readable, writable } from "svelte/store"
import { getUserID } from "../util";
import { lesson, difficulty, taskSpec } from "./lesson";

class lessonSet {
    lessons: Array<lesson>;
    constructor(lessons: Array<lesson>) {
        this.lessons = lessons
    }

    recordScore(task: taskSpec) {
        // TODO: more efficient
        for (let i = 0; i < this.lessons.length; i++) {
            const l = this.lessons[i];
            if (l.name === task.lesson) {
                l.recordScore(task)
                return
            }
        }

        throw new Error(`Couldn't find lesson called ${task}`)
    }

    has (lesson: string) {
        // TODO: more efficient
        for (let i = 0; i < this.lessons.length; i++) {
            const l = this.lessons[i];
            if (l.name === lesson) return true
        }
        return false
    }
}

export function defaultLessons():lessonSet {
    return new lessonSet([
        new lesson(difficulty.Beginner, "Mary Had a Little Lamb", [[1, 3, 5, 7, 9], [1, 5, 9], [1, 9]]),
        new lesson(difficulty.Beginner, "Twinkle Twinkle Little star", [[1, 3, 5, 7, 9, 11, 13]]),
        new lesson(difficulty.Beginner, "Silent Night", [[1,5,9,13,17,21,25]]),
        new lesson(difficulty.Beginner, "Test", [[1]]),
        new lesson(difficulty.Intermediate, "Fur Elise", [Array(8).fill(0).map((_, index) => index * 4 + 1)]),
        new lesson(difficulty.Intermediate, "Piano Man", [Array(8).fill(0).map((_, index) => index * 4 + 1)]),
    ])
}

export function getLessons():Readable<lessonSet> {
    let store = writable(defaultLessons())

    getUserID((userID: string) => {
        // getLessonProgress(userID, (lessonProgress: lessonSet) => {
        //     store.set(lessonProgress)
        // })
        console.log("got userID", userID)
    })

    return store
}
