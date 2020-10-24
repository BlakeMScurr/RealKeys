<script lang="ts">
    import { onMount } from "svelte";
    import type { Note } from "../../../lib/music/theory/notes";
    import { vertexCode, fragmentCode } from "./GL"
    import { TimedNote, TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoroll";

    export let keys:Array<Note>;
    // export let height:number;
    // export let unit:string;
    export let bars:Bars;
    export let notes:TimedNotes;
    // export let position = 0;
    export let zoomWidth = 0.2;
    export let recording = true;

    let zoomedNotes = notes.notes.map((note) => {
        return new TimedNote(note.start / zoomWidth, note.end / zoomWidth, note.note)
    })

    let zoomedBars = bars.bars.map((bar) => {
        return bar / zoomWidth
    })

    onMount(()=>{
        main()
    })

    // Boilerplate taken from https://www.creativebloq.com/javascript/get-started-webgl-draw-square-7112981
    function main() {
        const canvas:HTMLCanvasElement = document.querySelector("#glCanvas");

        // Initialize the GL context
        const gl = canvas.getContext("webgl");

        // Fix blur
        let dpr = window.devicePixelRatio
        if( dpr !== 1 ){
            canvas.height = canvas.clientHeight * dpr
            canvas.width = canvas.clientWidth * dpr
        }

        // Only continue if WebGL is available and working
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        setBackground(gl, canvas)
        let program = initProgram(gl)
        drawBlackkeys(gl, program)
        drawDividers(gl, program)
        drawBars(gl, program)
        drawNotes(gl, program)
    }

    function square(x, y, width, height) {
        return [
            // First triangle
            x, y,
            x + width, y,
            x, y + height,
            
            // Second triangle
            x + width, y + height,
            x + width, y,
            x, y + height,
        ]
    }

    function drawNotes(gl, program) {
        let noteToX = new Map();
        let width = 2 / keys.length

        keys.forEach((key, i) => {
            noteToX.set(key.string(), width * i - 1)
        })

        var points = []
        zoomedNotes.forEach((note) => {
            let x = noteToX.get(note.note.string())
            let sqr = square(x, note.start * 2 - 1, width, (note.end - note.start) * 2)
            points.push(...sqr)
        })

        var vertices = new Float32Array(points);
        drawTriangles(gl, program, new glColour(0.3984375, 0.4921875, 0.828125, 1.0), vertices)
    }

    function drawBars(gl, program) {
        var points = []
        // position just records widths of previous bars, since they're widths not positions in the song
        let position = 0
        zoomedBars.forEach((bar) => {
            position += bar
            points.push(
                -1, position * 2 - 1,
                1, position * 2 - 1,
            )
        })
        var vertices = new Float32Array(points);
        drawLines(gl, program, new glColour(1, 1, 1, 1.0), vertices)
    }

    function drawDividers(gl, program) {
        let width = 2 / keys.length
        var points = []
        for (var i = 0; i < keys.length - 1; i++) {
            if (!keys[i].abstract.accidental && !keys[i+1].abstract.accidental) {
                points.push(
                    -1 + (i + 1) * width, -1,
                    -1 + (i + 1) * width, 1,
                )
            }
        }
        var vertices = new Float32Array(points);
        drawLines(gl, program, new glColour(1, 1, 1, 1.0), vertices)
    }

    function drawBlackkeys(gl, program) {
        let width = 2 / keys.length
        var points = []
        keys.forEach((key, i)=> {
            if (key.abstract.accidental) {
                points.push(...square(i * width -1, -1, width, 2))
            }
        })
        var vertices = new Float32Array(points);
        drawTriangles(gl, program, new glColour(0.3515625, 0.3515625, 0.3515625, 1.0), vertices)
    }

    function drawLines (gl, program, colour: glColour, vertices: Float32Array) {
        drawStuff(gl, program, colour, vertices, gl.LINES)
    }
    function drawTriangles (gl, program, colour: glColour, vertices: Float32Array) {
        drawStuff(gl, program, colour, vertices, gl.TRIANGLES)
    }

    function drawStuff (gl, program, colour: glColour, vertices: Float32Array, primitive) {
        let vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        let itemSize = 2;
        let numItems = vertices.length / itemSize;

        gl.useProgram(program);

        let uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform4fv(uColor, colour.array());

        let aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
        gl.enableVertexAttribArray(aVertexPosition);
        gl.vertexAttribPointer(aVertexPosition, itemSize, gl.FLOAT, false, 0, 0);

        gl.drawArrays(primitive, 0, numItems);
    }

    function setBackground(gl, canvas) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.546875, 0.546875, 0.546875, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    function initProgram(gl) {
        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vertexCode);
        gl.compileShader(vs);

        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fragmentCode);
        gl.compileShader(fs);

        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vs));
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fs));
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.log(gl.getProgramInfoLog(program));

        return program
    }

    class glColour {
        r: number;
        g: number;
        b: number;
        opacity: number;

        constructor(r, g, b, opacity) {
            this.r = r
            this.g = g
            this.b = b
            this.opacity = opacity
        }

        // formats colour in a format usable by gl.uniform4fv
        array() {
            return [this.r, this.g, this.b, this.opacity]
        }
    }
</script>

<style>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>

<canvas id="glCanvas" width="400px" height="300px"></canvas>