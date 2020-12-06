<script lang="ts">
    // TOOD: use webgl - cpu spikes on scroll right now
    // TODO: allow scrolling
    import { niceBlue } from "../../colours";
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import { TimedNote } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoroll";
    import RollKey from "./RollKey.svelte";
    import { zoomWidth } from './roll.ts'
    import { currentSong } from "../../../stores/stores";

    export let keys:Array<Note>;
    export let height:number;
    export let unit:string;
    export let bars:Bars;
    export let notes:TimedNotes;
    export let position = 0;
    export let recording = true;
    export let editable = false;
    export let playing;

    // the place on the screen where the user should start playing the note
    // TODO: why does the length actually seem a bit long, perhaps 5x longer
    let zw = zoomWidth()
    $: zoomEnd = recording ? position : position + zw
    $: zoomStart = recording ? position - zw : position

    // Reverse stuff so that it looks right
    // TODO: no ugly reversing stuff
    $: zs = 1- zoomEnd
    $: ze = 1 - zoomStart

    $: zoomRatio = ze - zs
    $: viewHeight = height / zoomRatio
    $: zoomOffset = height * zs / zoomRatio

    function find(n: Note, ns: Array<Note>) {
        // TODO: efficient lookup
        for (let i = 0; i < ns.length; i++) {
            const note = ns[i];
            if (note.equals(n)) {
                return i
            }
            
        }
        return -1
    }

    let index = -1
    let type = ""
    let unsaved = false
    const scaledown = 400
    function handleMouseMove(e) {
        if (index != -1) {
            if (type == "start") {
                notes.notes[index].start -= zoomRatio * e.movementY / scaledown
            } else if (type == "end") {
                notes.notes[index].end -= zoomRatio * e.movementY / scaledown
            } else if (type == "middle") {
                notes.notes[index].start -= zoomRatio * e.movementY / scaledown
                notes.notes[index].end -= zoomRatio * e.movementY / scaledown
            }

            if (notes.notes[index].end <= notes.notes[index].start) {
                notes.notes.splice(index, 1)
                index = -1
                type = ""
            }
            notes = notes
            unsaved = true
        }
    }

    function mouseup(){
        if (editable) {
            index = -1
            type = ""
        }
    }
   
    function mousedown(i: number, newtype: string) {
        return function (e) {
            if (editable) {
                e.stopPropagation()
                index = i
                type = newtype
            }
        }
    }

    function handleNewNote(e) {
        if (editable) {
            if (Array.from(e.path[0].classList.values()).indexOf("notescontainer") == -1) {
                console.log("clicking where note already exists")
                return
            }
    
            let clientWidth = e.path[0].clientWidth
            let noteIndex = Math.floor((e.offsetX / clientWidth) * keys.length)
            
            let notemiddle = (1 - ((e.offsetY)/e.path[0].clientHeight)) * zoomRatio + position - zw

            const noteRadius = 1000/duration // one second
            notes.add(new TimedNote(notemiddle - noteRadius, notemiddle + noteRadius, keys[noteIndex].deepCopy()))
            notes = notes
            unsaved = true
        }
    }

    function handleSave() {
        // TODO: show recent edits etc
        unsaved = false
        notes.sort()
        currentSong.set(notes)
    }
</script>

<style>
    div {
        overflow: hidden;
    }

    .container {
        width: 100%;
        height: var(--height);
        position: absolute;
    }

    .bar {
        top: var(--top);
        height: 1px;
        background-color: white;
        width: 100%;
        position: absolute;
    }

    .note {
        position: absolute;
        height: 10px;
        left: var(--left);
        top: var(--top);
        width: var(--width);
        /* Subtracting a pixel is a hack to make sure we don't cover the barlines with notes when we have notes that fill up entire bars */
        /* This will probably be irrelevant when most values are input with live audio rather than as numbers */
        /* TODO: either remove this, or only attempt to reveal barlines in select cases, say, those where the next note is immediate or almost immediate */
        height: calc(var(--height) - 1px);
    }

    .mainnote {
        background-color: #667ED4;
    }

    .movable {
        cursor: move;
    }

    .keybackground {
        z-index: 0;
    }

    .barlines {
        z-index: 3;
    }

    .notescontainer {
        z-index: 4;
    }

    .edit {
        width: 100%;
        height: 8px;
        cursor: ns-resize;
    }

    .StartNote {
        position: absolute;
        bottom: 0;
    }
</style>

{#if unsaved}
    <button on:click={handleSave}>Save</button>
{/if}

<!-- Key Backgrounds -->
<div class="container keybackground" style="--height: {height + unit};">
    {#each keys as key, i}
        <RollKey width={100/keys.length + "%"} height={"100%"} white={key.color()=="white"} rightBorder={(key.abstract.letter == "b" || key.abstract.letter == "e") && i != keys.length - 1}></RollKey>
    {/each}
</div>
<!-- Bar Lines -->
<div class="container barlines" style="--height: {height + unit};">
    {#each bars.sums() as bar}
        <div class="bar" style="--top: {(viewHeight * (1-bar) - zoomOffset) + unit};"></div>
    {/each}
</div>
<!-- Notes -->
<div class="container notescontainer" style="--height: {height + unit};" on:mouseup={mouseup} on:mousemove={handleMouseMove} on:dblclick={handleNewNote}>
    {#each notes.notes as note, i}
        {#if find(note.note, keys) != -1}
            <div class="{"note mainnote" + (editable ? " movable" : "")}" style="--width: {100/keys.length}%;
                --left: {find(note.note, keys) * 100/keys.length}%;
                --height: {100*((1-note.start)-(1-note.end))/zoomRatio}%;
                --top:{
                    100*(1-note.end)/zoomRatio - zoomOffset
                }%;
                --color: {niceBlue}"
                on:mousedown={mousedown(i, "middle")}
            >
                {#if editable}
                    <div class="edit EndNote" on:mousedown={mousedown(i, "end")}></div>
                    <div class="edit StartNote" on:mousedown={mousedown(i, "start")}></div>
                {/if}
            </div>
        {/if}
    {/each}
</div>
