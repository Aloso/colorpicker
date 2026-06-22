import {
  angleSlider,
  defaultSlider,
  hsWheelCoords,
  noLut,
  type ColorSpace,
} from ".";

import hsvShader from "../shaders/hsvFragment.glsl?raw";

export const hsv: ColorSpace = {
  name: "HSV",
  mode: "hsv",

  sliders: [
    angleSlider("h", "Hue"),
    defaultSlider("s", "Saturation"),
    defaultSlider("v", "Value"),
  ],

  shaderValue: "v",
  shader: hsvShader,
  coords: hsWheelCoords,
  lut: noLut,
};
