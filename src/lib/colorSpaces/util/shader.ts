export interface Shader {
  type: 'round' | 'square'
  wideGamut: boolean

  wgslShader?: string
  glslShader?: string
}
