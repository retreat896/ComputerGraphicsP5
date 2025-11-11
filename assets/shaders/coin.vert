precision highp float;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * viewModelPosition;
  vTexCoord = aTexCoord;
  vNormal = normalize(mat3(uNormalMatrix) * aNormal);
  vPosition = viewModelPosition.xyz;
}
