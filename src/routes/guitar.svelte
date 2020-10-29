<script lang="ts">
    import { AbstractNote, NewNote, noteRange } from "./../lib/music/theory/notes"
    import type { Note } from "./../lib/music/theory/notes"
    import { onMount } from "svelte"

    let stringNote = NewNote("C", 4); // temp to prevent compile error
    let fret;
    let expected;
    let stringNum;

    function randString() {
        const notes =  [
            NewNote("E", 0),
            NewNote("A", 0),
            NewNote("D", 0),
            NewNote("G", 0),
            NewNote("B", 0),
        ]
        stringNum = randTo(5)
        let x = notes[stringNum]
        return x
    }

    function randTo(n) {
        return Math.trunc(Math.random() * n)
    }

    function handleInput (note: Note) {
        return function () {
            if (note.abstract.string() == expected.abstract.string()) {
                update()
                draw(canvas)
            } else {
                console.log("expected", expected.abstract.string(), "got", note)
            }
        }
    }

    let canvas;
    onMount(() => {
        update()
    });

    function update() {
        stringNote = randString()
        fret = randTo(11) + 1
        expected = stringNote.jump(fret)
        draw(canvas)
    }
    
    function draw(canvas) {
        const height = 200
        const width = 1000
        const ctx = canvas.getContext('2d');
        
        // background
        ctx.fillStyle= "#8B4513"
        ctx.fillRect(0, 0, width, height)

        const stringHeight = (i) => {
            return i * height / 6 + height / 12
        }

        // strings
        ctx.fillStyle = "#ffdfa1"
        let thickness = 2;
        for (var i = 0; i <= 6; i ++) {
            if (i >= 3) {
                ctx.fillStyle = "#F0F0F0"
                thickness = 4;
            }
            ctx.fillRect(0, stringHeight(i) - thickness / 2, width, thickness)
        }
        
        // frets
        ctx.fillStyle = "#F0F0F0"
        const trt = 1.05946309436 // twelfth root of two
        let curr = trt
        for (var i = 0; i <= 12; i++) {
            const xcoordinate = (percentage)=> {
                return (1-(percentage - 1))*width
            }
            let x = xcoordinate(curr)
            ctx.fillRect(x, 0, 2, height)
            curr *= trt

            const cf = (12 - i) // currentfret
            // note
            if (fret === cf - 1) {
                ctx.fillStyle = "#F00"
                let x = (1-(curr - 1))*width + 30
                const rad = 10
                ctx.fillRect(x, stringHeight(5 - stringNum) - rad, rad * 2, rad * 2)
                ctx.fillStyle = "#F0F0F0"
            }

            // inlay
            if (cf == 3 || cf == 5 || cf == 7 || cf == 9 || cf == 12) {
                const centerX = (x + xcoordinate(curr/trt/trt))/2;
                // console.log(x, xcoordinate(trt * curr))
                // console.log((x + xcoordinate(trt * curr))/2)
                const centerY = canvas.height / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
                ctx.fillStyle = "#F0F0F0"
                ctx.fill();
            }
        }
    }

    const noteChoices = noteRange(NewNote("C", 0), NewNote("B", 0))
</script>

<style>
    .guesser {
        margin: 5px;
        width: 50px;
        height: 50px;
    }
</style>

<canvas
bind:this={canvas}
width={1000}
height={200}
></canvas>

<br>

{stringNote.abstract.string().toLocaleUpperCase()} string, Fret {fret}
<br>
{#each noteChoices as note}
    <button class="guesser" on:click={handleInput(note)}>{note.abstract.prettyString()}</button>
{/each}
<br>
<button on:click={update}>Try Another</button>