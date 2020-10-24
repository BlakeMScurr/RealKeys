export const vertexCode = `
attribute vec2 aVertexPosition;

void main() {
gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}`

export const fragmentCode = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec4 uColor;

void main() {
gl_FragColor = uColor;
}`