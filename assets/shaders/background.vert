precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float time;

varying vec2 vTexCoord;

void main() {
  vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);
  
  // Create wave effect on Y position
  float wave = sin(aPosition.x * 0.01 + time * 0.002) * 5.0;
  viewModelPosition.y += wave;
  
  gl_Position = uProjectionMatrix * viewModelPosition;
  vTexCoord = aTexCoord;
}
