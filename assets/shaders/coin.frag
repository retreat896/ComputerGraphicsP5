precision highp float;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;
uniform sampler2D uTexture;
uniform float time;

void main() {
  vec4 texColor = texture2D(uTexture, vTexCoord);
  
  // Only apply sheen to pixels that are part of the coin (have alpha)
  if (texColor.a < 0.1) {
    discard;
  }
  
  // Create a narrow sheen band that moves left to right
  float sheenPos = mod(time * 0.0005, 1.0);
  float sheenWidth = 0.08;
  float sheen = smoothstep(sheenPos - sheenWidth, sheenPos, vTexCoord.x) - 
                smoothstep(sheenPos, sheenPos + sheenWidth, vTexCoord.x);
  
  // Apply sheen only where the texture is visible
  float sheenIntensity = sheen * texColor.a;
  
  // Add bright highlight
  vec3 highlight = vec3(1.0, 1.0, 0.95) * sheenIntensity * 1.2;
  vec3 finalColor = texColor.rgb + highlight;
  
  gl_FragColor = vec4(finalColor, texColor.a);
}
