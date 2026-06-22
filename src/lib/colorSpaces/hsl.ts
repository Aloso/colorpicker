import {
  angleSlider,
  defaultSlider,
  hsWheelCoords,
  noLut,
  type ColorSpace,
} from ".";

import hslShader from "../shaders/hslFragment.glsl?raw";

export const hsl: ColorSpace = {
  name: "HSL",
  mode: "hsl",

  sliders: [
    angleSlider("h", "Hue"),
    defaultSlider("s", "Saturation"),
    defaultSlider("l", "Lightness"),
  ],

  shaderValue: "l",
  shader: hslShader,
  coords: hsWheelCoords,
  lut: noLut,
};
