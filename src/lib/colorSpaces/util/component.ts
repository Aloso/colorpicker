import type { Shader } from './shader'

export interface Component {
  key: string
  label: string
  min: number
  max: number
  step: number
  unit?: string
  scale: number
  shader?: Shader
}

interface Props {
  wideGamut?: boolean
  wgslShader?: string
  glslShader?: string
}

export function regularComponent(key: string, label: string, props: Props = {}): Component {
  const shader: Shader = { type: 'square', wideGamut: false, ...props }
  return { key, label, min: 0, max: 1, step: 0.001, unit: '%', scale: 100, shader }
}

export function angleComponent(key: string, label: string, props: Props = {}): Component {
  const shader: Shader = { type: 'round', wideGamut: false, ...props }
  return { key, label, min: 0, max: 360, step: 0.1, unit: '°', scale: 1, shader }
}

export function rgbComponent(key: string, label: string, props: Props = {}): Component {
  const shader: Shader = { type: 'square', wideGamut: false, ...props }
  return { key, label, min: 0, max: 1, step: 1 / 2550, scale: 255, shader }
}

export function percentComponent(key: string, label: string, props: Props = {}): Component {
  const shader: Shader = { type: 'square', wideGamut: false, ...props }
  return { key, label, min: 0, max: 100, step: 0.1, unit: '%', scale: 1, shader }
}

export function minMaxComponent(
  key: string,
  label: string,
  min: number,
  max: number,
  props: Props = {},
): Component {
  const range = max - min
  const step =
    range >= 1000 ? 1 : range >= 100 ? 0.1 : range >= 10 ? 0.01 : range >= 1 ? 0.001 : 0.0001
  const shader: Shader = { type: 'square', wideGamut: false, ...props }
  return { key, label, min, max, step, scale: 1, shader }
}
