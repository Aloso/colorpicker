import { rgb as convertRgb, p3 as convertToP3 } from 'culori'

import type { ColorSpace } from '.'
import { minMaxComponent, percentComponent } from './util/component'
import { toHalf } from '../helpers/wgpuRenderSquare.svelte'

import shader from '../shaders/_square.glsl?raw'
import wgpuShader from '../shaders/_square.wgsl?raw'

export const lab: ColorSpace = {
  name: 'CIE Lab',
  mode: 'lab',

  components: [
    percentComponent('l', 'Lightness', { wideGamut: true }),
    minMaxComponent('a', 'a*', -125, 125, { wideGamut: true }),
    minMaxComponent('b', 'b*', -125, 125, { wideGamut: true }),
  ],
  defaultComponent: 'l',

  shaderValue: 'l',
  shader,
  wgpuShader,

  coords: (col) => [(col as any).a / 2.5 + 50, 50 - (col as any).b / 2.5],
  lut: (col, size) => {
    const data = new Float32Array(size * size * 4)
    for (let y = 0; y < size; y++) {
      const b = (y / (size - 1)) * 250 - 125
      for (let x = 0; x < size; x++) {
        const a = (x / (size - 1)) * 250 - 125
        const color = convertRgb({ mode: 'lab', l: (col as any).l, a, b })

        const idx = (y * size + x) * 4
        data[idx] = color.r
        data[idx + 1] = color.g
        data[idx + 2] = color.b
        data[idx + 3] = 1.0
      }
    }
    return data
  },
  wgpuLut: (col, size) => {
    const data = new Uint16Array(size * size * 4)
    for (let y = 0; y < size; y++) {
      const b = (y / (size - 1)) * 250 - 125
      for (let x = 0; x < size; x++) {
        const a = (x / (size - 1)) * 250 - 125
        const color = convertToP3({ mode: 'lab', l: (col as any).l, a, b })

        const idx = (y * size + x) * 4
        data[idx] = toHalf(color.r)
        data[idx + 1] = toHalf(color.g)
        data[idx + 2] = toHalf(color.b)
        data[idx + 3] = 0x3c00
      }
    }
    return data
  },
}
