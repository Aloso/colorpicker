import { hsWheelCoords, noLut, type ColorSpace } from '.'
import { angleComponent, regularComponent } from './util/component'

import glslShader from '../shaders/hsl.glsl?raw'

export const hsl: ColorSpace = {
  name: 'HSL',
  mode: 'hsl',

  components: [
    angleComponent('h', 'Hue'),
    regularComponent('s', 'Saturation'),
    regularComponent('l', 'Lightness', { glslShader }),
  ],
  defaultComponent: 'l',

  shaderValue: 'l',
  shader: glslShader,
  coords: hsWheelCoords,
  lut: noLut,
}
