#version 300 es
precision highp float;

#define M_PI 3.1415926535897932384626433832795
#define PI M_PI
#define TWO_PI 6.28318530717958647693

uniform vec2 u_resolution;
uniform float u_padding;
uniform float u_value;

out vec4 fragColor;

// OKLAB IMPORTS

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

  vec3 finalColor = okhsv_to_srgb(vec3(hue, fromCenter, u_value));
  fragColor = vec4(finalColor, alpha);
}