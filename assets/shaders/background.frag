precision highp float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;

void main() {
  vec4 texColor = texture2D(uTexture, vTexCoord);
  gl_FragColor = texColor;
}
