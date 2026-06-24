function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Failed to create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compilation failed: ${info}`)
  }
  return shader
}

function initLutTexture(gl: WebGL2RenderingContext) {
  const lutTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, lutTexture)

  // Set texture parameters for smooth interpolation and edge clamping
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return lutTexture
}

function updateLutTexture(gl: WebGL2RenderingContext, data: Float32Array, size: number) {
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, // Mipmap level
    gl.RGBA16F, // Internal format (GPU side)
    size, // Width
    size, // Height
    0, // Border (must be 0)
    gl.RGBA, // Format of source data
    gl.FLOAT, // Data type of source data
    data,
  )
}

const vertexShaderSource = `#version 300 es
precision highp float;

in vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}`

interface ShaderProps {
  fragment: string
  lut?: boolean
  lutSize?: number
}

interface Getters {
  padding: () => number
  cornerRadius: () => number
  value: () => number
  lut?: (size: number) => Float32Array
}

export function renderSquare(shader: ShaderProps, getters: Getters) {
  return function renderCanvas(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false })
    if (!gl) return

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, shader.fragment)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program)
      gl.deleteProgram(program)
      throw new Error(`Program linking failed: ${info}`)
    }

    const positionLoc = gl.getAttribLocation(program, 'position')
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    const paddingLoc = gl.getUniformLocation(program, 'u_padding')
    const cornerRadiusLoc = gl.getUniformLocation(program, 'u_corner_radius')
    const valueLoc = gl.getUniformLocation(program, 'u_value')
    const lutLoc = gl.getUniformLocation(program, 'u_lut')

    const tSize = shader.lutSize ?? 128

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const lutTexture = shader.lut ? initLutTexture(gl) : undefined

    let w = 0
    let h = 0

    const render = () => {
      if (w === 0 || h === 0) {
        // needed to make these properties reactive
        getters.padding()
        getters.cornerRadius()
        getters.value()
        getters.lut?.(tSize)
        return
      }

      gl.viewport(0, 0, w, h)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.bindVertexArray(vao)

      gl.uniform2f(resolutionLoc, w, h)
      gl.uniform1f(paddingLoc, getters.padding() * devicePixelRatio)
      gl.uniform1f(cornerRadiusLoc, getters.cornerRadius() * devicePixelRatio)
      gl.uniform1f(valueLoc, getters.value())

      if (getters.lut && lutTexture) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, lutTexture)
        updateLutTexture(gl, getters.lut(tSize), tSize)
        gl.uniform1i(lutLoc, 0)
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const devicePixelBox = entry.devicePixelContentBoxSize?.[0]
        if (devicePixelBox) {
          w = canvas.width = devicePixelBox.inlineSize
          h = canvas.height = devicePixelBox.blockSize
        } else {
          const { inlineSize, blockSize } = entry.contentBoxSize?.[0] ?? entry.contentRect
          w = canvas.width = Math.round(inlineSize * devicePixelRatio)
          h = canvas.height = Math.round(blockSize * devicePixelRatio)
        }
        render()
      }
    })
    resizeObserver.observe(canvas, { box: 'device-pixel-content-box' })

    $effect(() => {
      render()
    })

    return () => {
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(positionBuffer)
      gl.deleteVertexArray(vao)
      if (lutTexture) {
        gl.deleteTexture(lutTexture)
      }
    }
  }
}
