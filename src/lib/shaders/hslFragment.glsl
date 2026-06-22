#version 300 es
precision highp float;

#define M_PI 3.1415926535897932384626433832795
#define PI M_PI
#define TWO_PI 6.28318530717958647693

uniform vec2 u_resolution;
uniform float u_padding;
uniform float u_value;

out vec4 fragColor;

float hue_to_rgb(float p, float q, float t) {
  if (t < 0.0)
    t += 1.0;
  if (t > 1.0)
    t -= 1.0;
  if (t < 1.0 / 6.0)
    return p + (q - p) * 6.0 * t;
  if (t < 1.0 / 2.0)
    return q;
  if (t < 2.0 / 3.0)
    return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}

vec3 hsl_to_rgb(vec3 hsl) {
  float h = hsl.x;
  float s = hsl.y;
  float l = hsl.z;

  if (s == 0.0) {
    return vec3(l);
  }

  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;

  return vec3(hue_to_rgb(p, q, h + 1.0 / 3.0), hue_to_rgb(p, q, h),
              hue_to_rgb(p, q, h - 1.0 / 3.0));
}

void main() {
  vec2 mid = u_resolution * 0.5;
  vec2 r = gl_FragCoord.xy - mid;
  float radius = mid.x - u_padding;

  float dx = r.x / radius;
  float dy = r.y / radius;
  float fromCenter = length(vec2(dx, dy));

  // Calculate how wide a single pixel is in our normalized [0, 1] space
  float edgeWindow = 1.0 / radius;

  // Smoothly transition alpha right at the boundary edge (1.0)
  float alpha = 1.0 - smoothstep(1.0 - edgeWindow, 1.0, fromCenter);

  // Hard discard anything entirely outside the smoothing window for performance
  if (fromCenter > 1.0 + edgeWindow) {
    discard;
  }

  float angle = -atan(r.y, r.x) + M_PI;
  float hue = fract((angle / M_PI) * 0.5 + 0.5);

  vec3 finalColor = hsl_to_rgb(vec3(hue, fromCenter, u_value));
  fragColor = vec4(finalColor, alpha);
}