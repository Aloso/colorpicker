import type { MyColor } from '../../state.svelte'

export * from './util/colorSpace'

export function hsWheelCoords(col: MyColor): [number, number] {
  const angle = (((col as any).h ?? 0) * Math.PI) / 180
  return [Math.cos(angle) * 50 * (col as any).s + 50, Math.sin(angle) * 50 * (col as any).s + 50]
}

export function noLut(_col: MyColor, _size: number) {
  return new Float32Array()
}

export * from './hsl'
export * from './hsv'
export * from './lab'
export * from './lch'
export * from './okhsl'
export * from './okhsv'
export * from './rgb'
