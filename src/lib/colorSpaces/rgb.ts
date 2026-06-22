import { noLut, rgbSlider, type ColorSpace } from ".";

import rgbShader from "../shaders/rgbFragment.glsl?raw";

export const rgb: ColorSpace = {
  name: "RGB",
  mode: "rgb",

  sliders: [
    rgbSlider("r", "Red"),
    rgbSlider("g", "Green"),
    rgbSlider("b", "Blue"),
  ],

  shaderValue: "b",
  shader: rgbShader,
  coords: (col) => [(col as any).r * 100, 100 - (col as any).g * 100],
  lut: noLut,
};
