#version 300 es
precision highp float;

#define M_PI 3.1415926535897932384626433832795
#define PI M_PI
#define TWO_PI 6.28318530717958647693

uniform vec2 u_resolution;
uniform float u_padding;
uniform float u_value;

out vec4 fragColor;

float srgb_transfer_ch(float c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * pow(c, 1.0 / 2.4) - 0.055;
}

vec3 linear_to_srgb(vec3 linear_rgb) {
  return vec3(srgb_transfer_ch(linear_rgb.r), srgb_transfer_ch(linear_rgb.g),
              srgb_transfer_ch(linear_rgb.b));
}

vec3 xyz_to_linear_srgb(vec3 xyz) {
  return vec3(3.2404542 * xyz.x - 1.5371385 * xyz.y - 0.4985314 * xyz.z,
              -0.9692660 * xyz.x + 1.8760108 * xyz.y + 0.0415560 * xyz.z,
              0.0556434 * xyz.x - 0.2040259 * xyz.y + 1.0572252 * xyz.z);
}

float lab_f_inv(float t) {
  return t > 6.0 / 29.0 ? t * t * t
                        : 3.0 * (6.0 / 29.0) * (6.0 / 29.0) * (t - 4.0 / 29.0);
}

vec3 lab_to_linear_srgb(vec3 lab) {
  float L = lab.x;
  float a = lab.y;
  float b = lab.z;

  float Xn = 0.950489;
  float Yn = 1.000000;
  float Zn = 1.088840;

  float fy = (L + 16.0) / 116.0;
  float fx = fy + (a / 500.0);
  float fz = fy - (b / 200.0);

  vec3 xyz = vec3(Xn * lab_f_inv(fx), Yn * lab_f_inv(fy), Zn * lab_f_inv(fz));
  return xyz_to_linear_srgb(xyz);
}

bool in_linear_gamut(vec3 linear_rgb) {
  return linear_rgb.r >= -0.001 && linear_rgb.r <= 1.001 &&
         linear_rgb.g >= -0.001 && linear_rgb.g <= 1.001 &&
         linear_rgb.b >= -0.001 && linear_rgb.b <= 1.001;
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
  float rad = hue * 2.0 * M_PI;

  float L = u_value;
  float max_chroma = 132.0;
  float C = fromCenter * max_chroma;
  float a = cos(rad) * C;
  float b = sin(rad) * C;

  vec3 linear_rgb = lab_to_linear_srgb(vec3(L, a, b));
  vec3 clamped_linear = clamp(linear_rgb, 0.0, 1.0);
  vec3 finalColor = linear_to_srgb(clamped_linear);
  fragColor = vec4(finalColor, alpha);
}