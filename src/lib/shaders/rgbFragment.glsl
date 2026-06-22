#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_padding;
uniform float u_corner_radius;
uniform float u_value; // blue

out vec4 fragColor;

float sd_rounded_box(vec2 p, vec2 b, vec4 r) {
  vec2 q = p.x > 0.0 ? (p.y > 0.0 ? vec2(r.x, r.y) : vec2(r.z, r.w))
                     : (p.y > 0.0 ? vec2(r.x, r.y) : vec2(r.z, r.w));
  vec2 d = abs(p) - b + vec2(q.x);
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - q.x;
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

  float r = (st.x - minPad) / (maxPad - minPad);
  float g = (st.y - minPad) / (maxPad - minPad);

  r = clamp(r, 0.0, 1.0);
  g = clamp(g, 0.0, 1.0);
  float b = u_value;

  fragColor = vec4(r, g, b, alpha);
}