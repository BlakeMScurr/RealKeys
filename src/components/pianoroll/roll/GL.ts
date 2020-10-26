export const vertexCode = `
attribute vec2 aVertexPosition;
uniform vec2 translate;
uniform int zoom;

void main() {
gl_Position = vec4(aVertexPosition + translate, 0.0, 1.0);
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
        this.translate = translate
    }

    setZoom(zoom: number){
        this.zoom = zoom
    }

    // ROLL SPECIFIC METHODS
    // -------------------------------

    drawNotes(keys, notes) {
        let noteToX = new Map();
        let width = 2 / keys.length
    
        keys.forEach((key, i) => {
            noteToX.set(key.string(), width * i - 1)
        })
    
        var points = []
        notes.forEach((note) => {
            let x = noteToX.get(note.note.string())
            let sqr = square(x, note.start * 2 - 1, width, (note.end - note.start) * 2)
            points.push(...sqr)
        })
    
        var vertices = new Float32Array(points);
        this.drawTriangles(new glColour(0.3984375, 0.4921875, 0.828125, 1.0), vertices, [0, this.translate])
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
        this.drawLines(new glColour(1, 1, 1, 1.0), vertices, [0, this.translate])
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
        this.drawLines(new glColour(1, 1, 1, 1.0), vertices, staticTranslation())
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
        this.drawTriangles(new glColour(0.3515625, 0.3515625, 0.3515625, 1.0), vertices, staticTranslation())
    }

    setBackground(canvas) {
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.clearColor(0.546875, 0.546875, 0.546875, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    
    // GENERAL UTILITIES
    // -------------------------------

    drawLines(colour: glColour, vertices: Float32Array, translation: Array<number>) {
        this.drawStuff(colour, vertices, this.gl.LINES, translation)
    }

    drawTriangles (colour: glColour, vertices: Float32Array, translation: Array<number>) {
        this.drawStuff(colour, vertices, this.gl.TRIANGLES, translation)
    }
    
    drawStuff (colour: glColour, vertices: Float32Array, primitive, translation: Array<number>) {
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