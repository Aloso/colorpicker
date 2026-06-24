import { hsWheelCoords, noLut, type ColorSpace } from '.'
import { angleComponent, regularComponent } from './util/component'

import glslShader from '../shaders/hsv.glsl?raw'

export const hsv: ColorSpace = {
  name: 'HSV',
  mode: 'hsv',

  components: [
    angleComponent('h', 'Hue'),
    regularComponent('s', 'Saturation'),
    regularComponent('v', 'Value', { glslShader }),
  ],
  defaultComponent: 'v',

  shaderValue: 'v',
  shader: glslShader,
  coords: hsWheelCoords,
  lut: noLut,
}
