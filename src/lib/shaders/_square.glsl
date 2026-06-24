#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_padding;
uniform float u_corner_radius;
uniform sampler2D u_lut;

out vec4 fragColor;

float sd_rounded_box(vec2 p, vec2 b, vec4 r) {
  vec2 q = p.x > 0.0 ? (p.y > 0.0 ? vec2(r.x, r.y) : vec2(r.z, r.w))
                     : (p.y > 0.0 ? vec2(r.x, r.y) : vec2(r.z, r.w));
  vec2 d = abs(p) - b + vec2(q.x);
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - q.x;
}

// A lightweight, high-performance pseudo-random noise function for dithering
float screenSpaceNoise(vec2 uv) {
  return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 mid = u_resolution * 0.5;
  vec2 p = gl_FragCoord.xy - mid;
  vec2 box_half_size = mid - vec2(u_padding);
  float distance = sd_rounded_box(p, box_half_size, vec4(u_corner_radius));

  float alpha = 1.0 - smoothstep(-1.0, 0.0, distance);
  if (distance > 0.0) {
    discard;
  }

  vec2 st = gl_FragCoord.xy / u_resolution;

  float minPad = u_padding / u_resolution.x;
  float maxPad = (u_resolution.x - u_padding) / u_resolution.x;

  vec2 uv = (st - minPad) / (maxPad - minPad);
  uv = clamp(uv, 0.0, 1.0);

  vec3 finalColor = texture(u_lut, uv).rgb;

  float noise = screenSpaceNoise(gl_FragCoord.xy);
  finalColor += (noise - 0.5) * (1.0 / 255.0);

  fragColor = vec4(finalColor, alpha);
}
