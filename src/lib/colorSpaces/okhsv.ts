import { hsWheelCoords, noLut, type ColorSpace } from '.'
import { angleComponent, regularComponent } from './util/component'

import shader from '../shaders/okhsv.glsl?raw'
import oklabLibrary from '../shaders/oklabLibrary.glsl?raw'

export const okhsv: ColorSpace = {
  name: 'Ok HSV',
  mode: 'okhsv',

  components: [
    angleComponent('h', 'Hue'),
    regularComponent('s', 'Saturation'),
    regularComponent('v', 'Value', {
      glslShader: shader.replace('// OKLAB IMPORTS', oklabLibrary),
    }),
  ],
  defaultComponent: 'v',

  shaderValue: 'v',
  shader: shader.replace('// OKLAB IMPORTS', oklabLibrary),
  coords: hsWheelCoords,
  lut: noLut,
}
