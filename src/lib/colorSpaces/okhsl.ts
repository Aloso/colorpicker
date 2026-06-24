import { hsWheelCoords, noLut, type ColorSpace } from '.'
import { angleComponent, regularComponent } from './util/component'

import shader from '../shaders/okhsl.glsl?raw'
import oklabLibrary from '../shaders/oklabLibrary.glsl?raw'

export const okhsl: ColorSpace = {
  name: 'Ok HSL',
  mode: 'okhsl',

  components: [
    angleComponent('h', 'Hue'),
    regularComponent('s', 'Saturation'),
    regularComponent('l', 'Lightness', {
      glslShader: shader.replace('// OKLAB IMPORTS', oklabLibrary),
    }),
  ],
  defaultComponent: 'l',

  shaderValue: 'l',
  shader: shader.replace('// OKLAB IMPORTS', oklabLibrary),
  coords: hsWheelCoords,
  lut: noLut,
}
