#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_padding;
uniform sampler2D u_lut;

out vec4 fragColor;

// A lightweight, high-performance pseudo-random noise function for dithering
float screenSpaceNoise(vec2 uv) {
  return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 mid = u_resolution * 0.5;
  vec2 r = gl_FragCoord.xy - mid;
  float radius = mid.x - u_padding;

  float fromCenter = length(r) / radius;

  // Standard anti-aliased circle mask
  float edgeWindow = 1.0 / radius;
  float alpha = 1.0 - smoothstep(1.0 - edgeWindow, 1.0, fromCenter);

  if (fromCenter > 1.0 + edgeWindow) {
    fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    discard;
  }

  vec2 uv = (r / radius) * 0.5 + 0.5;
  vec3 finalColor = texture(u_lut, uv).rgb;

  float noise = screenSpaceNoise(gl_FragCoord.xy);
  finalColor += (noise - 0.5) * (1.0 / 255.0);

  fragColor = vec4(finalColor, alpha);
}
