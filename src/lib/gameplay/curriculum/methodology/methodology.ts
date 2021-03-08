// A (teaching) methodology is a means of building a curriculum out of a content.
import type { curriculum } from "../curriculum";

export interface methodology {
    curriculum():curriculum
}