import { Readable, writable } from "svelte/store"
import { getUserID } from "../util";
import { lesson, difficulty, taskSpec, section, handSection } from "./lesson";
import { plainToClass } from 'class-transformer';
import 'reflect-metadata';
export interface LessonSet {
    recordScore(taskSpec)
}

// TODO: rewrite lessonSet and lessons from the ground up
// This will be to make the lesson definiton more flexible.
// - More speed options, 1%-150% (with the option of easily increasing the cap if the user asks for it)
// - Declarative way to define the dependencies between tasks
// - Easy way to alter dependencies (i.e., easily make a new lesson that allows 100% speed after own pace, and another that requires 50% between, while both have a 50% option)
// - Different kinds of section subdivisions, so that we can practice "glue" sections. I.e., if you learn bars 1-4, and 5-8, you can learn 3-6 to learn the transition.
// - OR vs AND dependencies, i.e., bars 1-3 BH 100% will be allow if you have ((bars 1-3 BH own pace) OR ((bars 1-3 LH 100%) AND (bars 1-3 RH 100%)))
// - Lesson progress should be serialisable to prevent the need to reparse on the client
// - Constructors should be simple and contain no real logic, to aid in serialisability
// - Lesson progress should be decouple from the set of available lessons, such that lesson progress should be empty if nothing has been done, and only a little data is added as progress is made
// - Finding a lesson in a lesson set should be trivial and require no iteration, likewise for a fully defined task. See navigate.ts.nextLeve() for the current problem, likewise the iteration in lesson.svelte
export class lessonSet {
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
        // No hand movement required
        new lesson(difficulty.Beginner, "Mary Had A Little Lamb", [[1, 5, 9], [1, 9]]),
        new lesson(difficulty.Beginner, "Alouette", [[1, 3, 5], [1, 5]]),
        new lesson(difficulty.Beginner, "Chopsticks", [[1,5,9,13,17], [1,9,17], [1,17]]),
        new lesson(difficulty.Beginner, "Twinkle Twinkle Little Star", [[1,5,9,13], [1,13]]),
        new lesson(difficulty.Beginner, "Yankee Doodle", [[1,5,9],[1,9]]),
        new lesson(difficulty.Beginner, "The Muffin Man", [[1,5,9],[1,9]]),
        new lesson(difficulty.Beginner, "Jingle Bells", [[1,5,9,13,17], [1,9,17], [1,17]]),
        new lesson(difficulty.Intermediate, "Row Row Row Your Boat", [[1,3,5], [1,5]]), // 8ve RH range, but otherwise easy
        new lesson(difficulty.Intermediate, "Piano Man", [[1, 5, 9, 15], [1, 15]]), // Hard rhythm
        new lesson(difficulty.Intermediate, "Ode to Joy", [[1,5,9,13,17], [1,9,17], [1,17]]), // 6th range LH, melody crossover
        new lesson(difficulty.Intermediate, "Baa Baa Black Sheep", [[1,5,9], [1,9]]), // 1 8ve RH range
        new lesson(difficulty.Intermediate, "Silent Night", [[1, 9, 17, 24], [1, 24]]),
    ])


}

// TODO: move this backend facing stuff into a separate file

export function getLessons():Readable<lessonSet> {
    let store = writable(defaultLessons())

    getUserID((userID: string) => {
        getLessonProgress(userID, (lessonProgress: lessonSet) => {
            store.set(lessonProgress)
        })
    })

    return store
}

export async function getLessonProgress(userID: string, cb: (lessonProgress: lessonSet)=>void) {
    let resp = await fetch("api/getLessonProgress?userID=" + userID)
    let json = await resp.json()
    cb(p2k(json.progress.progress)) // TODO: why do we need so many accesses of the progress proptery? Why do we need any, really?
}

export function saveLessonProgress(userID: string, progress: LessonSet) {
    fetch("api/saveLessonProgress?userID=" + userID, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(<lessonSet>progress)
      })
}

// This is ridiculous that we have to do this, but apparently we do
// TODO: Make an issue about the fact that if you have a nested constructor that may error, then the parent will not get the appropriate class of the child
function p2k(jsonTing: lessonSet):lessonSet {
    let ls = plainToClass(lessonSet, jsonTing)
    ls.lessons.forEach((l, i) => {
        ls.lessons[i] = plainToClass(lesson, l)
        let less = ls.lessons[i]
        less.sections.forEach((s, j) => {
            less.sections[j] = plainToClass(section, s)
            let sec = less.sections[j]
            sec.hands.forEach((hnd, k) => {
                sec.hands[k] = plainToClass(handSection, hnd)
            })
        })
    })

    return ls
}