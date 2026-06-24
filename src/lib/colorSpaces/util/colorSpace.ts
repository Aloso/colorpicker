import type { MyColor } from '../../../state.svelte'
import type { Component } from './component'

export interface ColorSpace {
  name: string
  mode: MyColor['mode']

  components: Component[]
  defaultComponent: string

  shaderValue: string
  shader: string
  wgpuShader?: string
  lut(color: MyColor, size: number): Float32Array
  wgpuLut?(color: MyColor, size: number): Uint16Array
  wgpuTextureSize?: number

  coords(color: MyColor): [number, number]
}
