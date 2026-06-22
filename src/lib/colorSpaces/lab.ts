import { percentSlider, v125Slider, type ColorSpace } from ".";
import { rgb as convertRgb } from "culori";

import textureShader from "../shaders/textureFragment.glsl?raw";

export const lab: ColorSpace = {
  name: "CIE Lab",
  mode: "lab",

  sliders: [
    percentSlider("l", "Lightness"),
    v125Slider("a", "a*"),
    v125Slider("b", "b*"),
  ],

  shaderValue: "l",
  shader: textureShader,
  coords: (col) => [(col as any).a / 2.5 + 50, 50 - (col as any).b / 2.5],
  lut: (col, size) => {
    const data = new Uint8Array(size * size * 3);
    for (let y = 0; y < size; y++) {
      const b = (y / (size - 1)) * 250 - 125;
      for (let x = 0; x < size; x++) {
        const a = (x / (size - 1)) * 250 - 125;
        const color = convertRgb({ mode: "lab", l: (col as any).l, a, b });

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
