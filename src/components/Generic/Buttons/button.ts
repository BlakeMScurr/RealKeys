
import { createEventDispatcher } from "svelte";

export function handleClick() {
    let dispatch = createEventDispatcher()
    dispatch("click")
}