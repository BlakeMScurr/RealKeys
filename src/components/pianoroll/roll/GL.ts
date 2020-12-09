import type { TimedNote } from "../../../lib/music/timed/timed";

export const vertexCode = `
attribute vec2 aVertexPosition;
uniform vec2 translate;
uniform vec2 moveUp;
uniform mat2 zoom;

void main() {
    gl_Position = vec4(zoom*(aVertexPosition+moveUp)-moveUp + translate, 0.0, 1.0);
}`

export const fragmentCode = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec4 uColor;

void main() {
gl_FragColor = uColor;
}`


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

export function initProgram(gl: WebGLRenderingContext) {
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

    return new drawer(gl, program)
}

function staticTranslation () {
    return [0,0]
}

function staticZoom() {
    return 1
}

class drawer {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    translate: number;
    zoom: number;
    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl
        this.program = program
        this.translate = 0;
        this.zoom = 1;
    }

    // POST INITIALISATION METHODS
    // -------------------------------

    setTranslate(translate: number){
        this.translate = -translate*2
    }

    setZoom(zoom: number){
        this.zoom = 1/zoom
    }

    // ROLL SPECIFIC METHODS
    // -------------------------------

    drawNotes(keys, notes: Array<TimedNote>) {
        let noteToX = new Map();
        let width = 2 / keys.length
    
        keys.forEach((key, i) => {
            noteToX.set(key.string(), width * i - 1)
        })
    
        var points = []
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i]

            // buffer at the end of the note if there's another straight after so they can be distinguished from one another
            // TODO: create a curved note model as per reccomendation at the start of https://webglfundamentals.org/webgl/lessons/webgl-3d-geometry-lathe.html
            let buffer = 0
            if (i + 1 < notes.length) {
                // TODO: look forward at all notes with an end before or equal to the current start
                console.log(notes[i+1].note.equals(note.note))
                console.log(notes[i+1].note.string())
                console.log(note.note.string())
                buffer = 0.1
            }


            let x = noteToX.get(note.note.string())
            let y = note.start * 2 - 1
            let height = (note.end - note.start) * 2
            let sqr = square(x, y, width,  height - buffer)
            points.push(...sqr)
        }
    
        var vertices = new Float32Array(points);
        this.drawTriangles(new glColour(0.3984375, 0.4921875, 0.828125, 1.0), vertices, [0, this.translate], this.zoom)
    }
    
    drawBars(bars) {
        var points = []
        // position just records widths of previous bars, since they're widths not positions in the song
        let position = 0
        bars.forEach((bar) => {
            position += bar
            points.push(
                -1, position * 2 - 1,
                1, position * 2 - 1,
            )
        })
        var vertices = new Float32Array(points);
        this.drawLines(new glColour(0.7, 0.7, 0.7, 1), vertices, [0, this.translate], this.zoom)
    }
    
    drawDividers(keys) {
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
        this.drawLines(new glColour(1, 1, 1, 0), vertices, staticTranslation(), staticZoom())
    }
    
    drawBlackkeys(keys) {
        let width = 2 / keys.length
        var points = []
        keys.forEach((key, i)=> {
            if (key.abstract.accidental) {
                points.push(...square(i * width -1, -1, width, 2))
            }
        })
        var vertices = new Float32Array(points);
        this.drawTriangles(new glColour(0.3515625, 0.3515625, 0.3515625, 1.0), vertices, staticTranslation(), staticZoom())
    }

    setBackground(canvas) {
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.clearColor(0.546875, 0.546875, 0.546875, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    
    // GENERAL UTILITIES
    // -------------------------------

    drawLines(colour: glColour, vertices: Float32Array, translation: Array<number>, zoom: number) {
        this.drawStuff(colour, vertices, this.gl.LINES, translation, zoom)
    }

    drawTriangles (colour: glColour, vertices: Float32Array, translation: Array<number>, zoom: number) {
        this.drawStuff(colour, vertices, this.gl.TRIANGLES, translation, zoom)
    }
    
    drawStuff (colour: glColour, vertices: Float32Array, primitive, translation: Array<number>, zoomScale: number) {
        let vbuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
        let itemSize = 2;
        let numItems = vertices.length / itemSize;

        this.gl.useProgram(this.program);

        let uColor = this.gl.getUniformLocation(this.program, "uColor");
        this.gl.uniform4fv(uColor, colour.array());

        let aVertexPosition = this.gl.getAttribLocation(this.program, "aVertexPosition");
        this.gl.enableVertexAttribArray(aVertexPosition);
        this.gl.vertexAttribPointer(aVertexPosition, itemSize, this.gl.FLOAT, false, 0, 0);

        let translate = this.gl.getUniformLocation(this.program, "translate");
        this.gl.uniform2fv(translate, translation);

        let moveUp = this.gl.getUniformLocation(this.program, "moveUp");
        this.gl.uniform2fv(moveUp, [0, 1]);

        
        let zoom = this.gl.getUniformLocation(this.program, "zoom");
        let matrix = [
            1, 0,
            0, zoomScale
        ]
        this.gl.uniformMatrix2fv(zoom, false, matrix);

        this.gl.drawArrays(primitive, 0, numItems);
    }
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