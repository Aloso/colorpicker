import { rgb as convertToRgb, p3 as convertToP3 } from 'culori'

import type { ColorSpace } from '.'
import { angleComponent, minMaxComponent, percentComponent } from './util/component'
import { toHalf } from '../helpers/wgpuRenderSquare.svelte'

import roundTexture from '../shaders/_round.wgsl?raw'
import roundTextureShader from '../shaders/_round.glsl?raw'

export const lch: ColorSpace = {
  name: 'CIE LCh',
  mode: 'lch',

  components: [
    percentComponent('l', 'Lightness', { wideGamut: true }),
    minMaxComponent('c', 'Chroma', 0, 150, { wideGamut: true }),
    angleComponent('h', 'Hue', { wideGamut: true }),
  ],
  defaultComponent: 'l',

  shaderValue: 'l',
  shader: roundTextureShader,
  wgpuShader: roundTexture,

  coords: (col) => {
    const angle = (((col as any).h ?? 0) * Math.PI) / 180
    return [
      (Math.cos(angle) * (col as any).c) / 3 + 50,
      (Math.sin(angle) * (col as any).c) / 3 + 50,
    ]
  },
  lut: (col, size) => {
    const data = new Float32Array(size * size * 4)
    const maxChroma = 150.0

    const fract = (num: number) => num - Math.floor(num)

    for (let y = 0; y < size; y++) {
      const ny = (y / (size - 1)) * 2.0 - 1.0
      for (let x = 0; x < size; x++) {
        const nx = (x / (size - 1)) * 2.0 - 1.0
        const distance = Math.hypot(nx, ny)
        const c = distance * maxChroma
        let angle = -Math.atan2(ny, nx) + Math.PI
        let hueNormalized = fract((angle / Math.PI) * 0.5 + 0.5)
        let h = hueNormalized * 360.0
        const color = convertToRgb({ mode: 'lch', l: (col as any).l, c, h })

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
    const maxChroma = 150.0

    const fract = (num: number) => num - Math.floor(num)

    for (let y = 0; y < size; y++) {
      const ny = (y / (size - 1)) * 2.0 - 1.0
      for (let x = 0; x < size; x++) {
        const nx = (x / (size - 1)) * 2.0 - 1.0
        const distance = Math.hypot(nx, ny)
        const c = distance * maxChroma
        let angle = Math.atan2(ny, nx) + Math.PI
        let hueNormalized = fract((angle / Math.PI) * 0.5 + 0.5)
        let h = hueNormalized * 360.0

        const color = convertToP3({ mode: 'lch', l: (col as any).l, c, h })
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
