import { angleSlider, percentSlider, t150Slider, type ColorSpace } from ".";
import { rgb as convertRgb } from "culori";

import roundTextureShader from "../shaders/roundTextureFragment.glsl?raw";

export const lch: ColorSpace = {
  name: "CIE LCh",
  mode: "lch",

  sliders: [
    percentSlider("l", "Lightness"),
    t150Slider("c", "Chroma"),
    angleSlider("h", "Hue"),
  ],

  shaderValue: "l",
  shader: roundTextureShader,
  coords: (col) => {
    const angle = (((col as any).h ?? 0) * Math.PI) / 180;
    return [
      (Math.cos(angle) * (col as any).c) / 3 + 50,
      (Math.sin(angle) * (col as any).c) / 3 + 50,
    ];
  },
  lut: (col, size) => {
    const data = new Uint8Array(size * size * 3);
    const maxChroma = 150.0;

    const fract = (num: number) => num - Math.floor(num);

    for (let y = 0; y < size; y++) {
      const ny = (y / (size - 1)) * 2.0 - 1.0;
      for (let x = 0; x < size; x++) {
        const nx = (x / (size - 1)) * 2.0 - 1.0;
        const distance = Math.hypot(nx, ny);
        const c = distance * maxChroma;
        let angle = -Math.atan2(ny, nx) + Math.PI;
        let hueNormalized = fract((angle / Math.PI) * 0.5 + 0.5);
        let h = hueNormalized * 360.0;
        const color = convertRgb({ mode: "lch", l: (col as any).l, c, h });

        const idx = (y * size + x) * 3;
        data[idx] = Math.max(
          0,
          Math.min(255, Math.round((color?.r ?? 0) * 255)),
        );
        data[idx + 1] = Math.max(
          0,
          Math.min(255, Math.round((color?.g ?? 0) * 255)),
        );
        data[idx + 2] = Math.max(
          0,
          Math.min(255, Math.round((color?.b ?? 0) * 255)),
        );
      }
    }

    return data;
  },
};
