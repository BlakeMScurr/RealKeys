<script lang="ts">
    import { onMount } from "svelte";
    import type { Note } from "../../../lib/music/theory/notes";
    // import type { TimedNotes } from "../../../lib/music/timed/timed";
    // import type { Bars } from "../pianoroll";

    export let keys:Array<Note>;
    // export let height:number;
    // export let unit:string;
    // export let bars:Bars;
    // export let notes:TimedNotes;
    // export let overlayNotes:TimedNotes;
    // export let position = 0;
    export let zoomWidth = 0.2;
    export let recording = true;

    onMount(()=>{
        main()
    })

    // Basically taken from https://www.creativebloq.com/javascript/get-started-webgl-draw-square-7112981
    function main() {
        const canvas:HTMLCanvasElement = document.querySelector("#glCanvas");
        // Initialize the GL context
        const gl = canvas.getContext("webgl");

        // Only continue if WebGL is available and working
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        var v = `
attribute vec2 aVertexPosition;

void main() {
gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}`

        var f = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec4 uColor;

void main() {
gl_FragColor = uColor;
}`

        // Set background colour
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.546875, 0.546875, 0.546875, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, v);
        gl.compileShader(vs);

        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, f);
        gl.compileShader(fs);

        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vs));
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fs));
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.log(gl.getProgramInfoLog(program));

        var aspect = canvas.width / canvas.height;

        var vertices = new Float32Array([
        -0.5, 0.5*aspect, 0.5, 0.5*aspect, 0.5,-0.5*aspect, // Triangle 1
        -0.5, 0.5*aspect, 0.5,-0.5*aspect, -0.5,-0.5*aspect // Triangle 2
        ]);

        let vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        let itemSize = 2;
        let numItems = vertices.length / itemSize;

        gl.useProgram(program);

        let uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform4fv(uColor, [0.0, 0.3, 0.0, 1.0]);

        let aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
        gl.enableVertexAttribArray(aVertexPosition);
        gl.vertexAttribPointer(aVertexPosition, itemSize, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, numItems);
    }
</script>

<canvas id="glCanvas" width="640" height="480"></canvas>