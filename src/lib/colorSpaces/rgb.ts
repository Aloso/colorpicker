import { rgb as convertRgb } from 'culori'

import type { ColorSpace } from '.'
import { rgbComponent } from './util/component'

import shader from '../shaders/_square.glsl?raw'

export const rgb: ColorSpace = {
  name: 'RGB',
  mode: 'rgb',

  components: [rgbComponent('r', 'Red'), rgbComponent('g', 'Green'), rgbComponent('b', 'Blue')],
  defaultComponent: 'r',

  shaderValue: 'r',
  shader,
  coords: (col) => [(col as any).b * 100, 100 - (col as any).g * 100],
  lut: (col, size) => {
    const rgbCol = convertRgb(col)

    const data = new Float32Array(size * size * 4)
    for (let y = 0; y < size; y++) {
      const b = y / (size - 1)
      for (let x = 0; x < size; x++) {
        const a = x / (size - 1)

        const idx = (y * size + x) * 4
        data[idx] = rgbCol.r
        data[idx + 1] = b
        data[idx + 2] = a
        data[idx + 3] = 1.0
      }
    }
    return data
  },
}
