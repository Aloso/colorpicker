import {
  angleSlider,
  defaultSlider,
  hsWheelCoords,
  noLut,
  type ColorSpace,
} from ".";

import okhsvShader from "../shaders/okhsvFragment.glsl?raw";
import oklabLibrary from "../shaders/oklabLibrary.glsl?raw";

export const okhsv: ColorSpace = {
  name: "Ok HSV",
  mode: "okhsv",

  sliders: [
    angleSlider("h", "Hue"),
    defaultSlider("s", "Saturation"),
    defaultSlider("v", "Value"),
  ],

  shaderValue: "v",
  shader: okhsvShader.replace("// OKLAB IMPORTS", oklabLibrary),
  coords: hsWheelCoords,
  lut: noLut,
};
