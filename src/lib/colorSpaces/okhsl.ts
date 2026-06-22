import {
  angleSlider,
  defaultSlider,
  hsWheelCoords,
  noLut,
  type ColorSpace,
} from ".";

import okhslShader from "../shaders/okhslFragment.glsl?raw";
import oklabLibrary from "../shaders/oklabLibrary.glsl?raw";

export const okhsl: ColorSpace = {
  name: "Ok HSL",
  mode: "okhsl",

  sliders: [
    angleSlider("h", "Hue"),
    defaultSlider("s", "Saturation"),
    defaultSlider("l", "Lightness"),
  ],

  shaderValue: "l",
  shader: okhslShader.replace("// OKLAB IMPORTS", oklabLibrary),
  coords: hsWheelCoords,
  lut: noLut,
};
