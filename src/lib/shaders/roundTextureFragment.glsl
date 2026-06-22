#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_padding;
uniform sampler2D u_lut;

out vec4 fragColor;

void main() {
  vec2 mid = u_resolution * 0.5;
  vec2 r = gl_FragCoord.xy - mid;
  float radius = mid.x - u_padding;

  float fromCenter = length(r) / radius;

  // Standard anti-aliased circle mask
  float edgeWindow = 1.0 / radius;
  float alpha = 1.0 - smoothstep(1.0 - edgeWindow, 1.0, fromCenter);

  if (fromCenter > 1.0 + edgeWindow) {
    discard;
  }

  vec2 uv = (r / radius) * 0.5 + 0.5;
  vec3 finalColor = texture(u_lut, uv).rgb;
  fragColor = vec4(finalColor, alpha);
}
