interface ShaderProps {
  fragment: string
  lut?: boolean
  lutSize?: number
}

interface Getters {
  padding: () => number
  cornerRadius: () => number
  background: () => number
  value: () => number
  wgpuLut?: (size: number) => Uint16Array
}

declare var GPUTextureUsage: any
declare var GPUBufferUsage: any
declare var GPUShaderStage: any

export function toHalf(val: number): number {
  const f32 = new Float32Array([val])
  const i32 = new Int32Array(f32.buffer)[0]
  const sign = (i32 >> 16) & 0x8000
  let exponent = ((i32 >> 23) & 0xff) - 127
  let mantissa = i32 & 0x7fffff

  if (exponent > 15) return sign | 0x7c00 // Clamp overflow to Infinity
  if (exponent < -14) return sign // Clamp underflow to Zero

  exponent += 15
  mantissa >>= 13
  return sign | (exponent << 10) | mantissa
}

export function wgpuRenderSquare(shader: ShaderProps, getters: Getters) {
  return function renderCanvas(canvas: HTMLCanvasElement) {
    let device: GPUDevice | null = null
    let context: GPUCanvasContext | null = null
    let pipeline: GPURenderPipeline | null = null
    let uniformBuffer: GPUBuffer | null = null
    let bindGroup: GPUBindGroup | null = null
    let lutTexture: GPUTexture | null = null
    let lutSampler: GPUSampler | null = null

    let tSize = shader.lutSize ?? 128
    let w = 0
    let h = 0
    let isInitialized = false

    async function initWebGPU() {
      if (!navigator.gpu) {
        console.error('WebGPU is not supported in this browser environment.')
        return
      }

      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) {
        console.error('No adapter returned')
        return
      }
      device = await adapter.requestDevice()

      context = canvas.getContext('webgpu') as GPUCanvasContext | null
      if (!context) return

      // Force wide-gamut Display-P3 compositor pipeline
      context.configure({
        device,
        format: 'rgba16float',
        colorSpace: 'display-p3',
      })

      // Uniform Buffer allocation (32 bytes to comfortably clear 16-byte layout alignment boundaries)
      uniformBuffer = device.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      // Set up bindings
      const bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ]

      if (shader.lut) {
        bindGroupLayoutEntries.push(
          {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: { type: 'filtering' },
          },
          {
            binding: 2,
            visibility: GPUShaderStage.FRAGMENT,
            texture: { sampleType: 'float', viewDimension: '2d' },
          },
        )

        lutSampler = device.createSampler({
          magFilter: 'linear',
          minFilter: 'linear',
          addressModeU: 'clamp-to-edge',
          addressModeV: 'clamp-to-edge',
        })

        lutTexture = device.createTexture({
          size: [tSize, tSize, 1],
          format: 'rgba16float',
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
      }

      const bindGroupLayout = device.createBindGroupLayout({
        entries: bindGroupLayoutEntries,
      })

      const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      })

      // Bypasses CPU buffers by assembling full-screen positions using vertex indexes directly
      const vertexModule = device.createShaderModule({
        code: `
          @vertex
          fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
            var pos = array<vec2<f32>, 6>(
              vec2<f32>(-1.0, -1.0),
              vec2<f32>( 1.0, -1.0),
              vec2<f32>(-1.0,  1.0),
              vec2<f32>(-1.0,  1.0),
              vec2<f32>( 1.0, -1.0),
              vec2<f32>( 1.0,  1.0)
            );
            return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
          }
        `,
      })

      const fragmentModule = device.createShaderModule({
        code: shader.fragment,
      })

      pipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
          module: vertexModule,
          entryPoint: 'main',
        },
        fragment: {
          module: fragmentModule,
          entryPoint: 'main',
          targets: [{ format: 'rgba16float' }],
        },
        primitive: {
          topology: 'triangle-list',
        },
      })

      // Construct Bind Group resources
      const bindGroupEntries: GPUBindGroupEntry[] = [
        { binding: 0, resource: { buffer: uniformBuffer } },
      ]

      if (shader.lut && lutSampler && lutTexture) {
        bindGroupEntries.push(
          { binding: 1, resource: lutSampler },
          { binding: 2, resource: lutTexture.createView() },
        )
      }

      bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: bindGroupEntries,
      })

      isInitialized = true
      render()
    }

    initWebGPU()

    const render = () => {
      const paddingVal = getters.padding() * devicePixelRatio
      const cornerRadiusVal = getters.cornerRadius() * devicePixelRatio
      const backgroundVal = getters.background()
      const progressVal = getters.value()
      const rawLutData = getters.wgpuLut?.(tSize)

      if (!isInitialized || !device || !context || !pipeline || !uniformBuffer || !bindGroup) {
        return
      }

      if (w === 0 || h === 0) return

      // 1. Pack uniform data conforming to strict byte step alignments
      const uniformData = new Float32Array(8)
      uniformData[0] = w
      uniformData[1] = h
      uniformData[2] = paddingVal
      uniformData[3] = cornerRadiusVal
      uniformData[4] = backgroundVal
      uniformData[5] = progressVal
      device.queue.writeBuffer(uniformBuffer, 0, uniformData)

      // 2. Ingest 4-channel texture data directly to texture memory
      if (shader.lut && rawLutData && lutTexture) {
        device.queue.writeTexture(
          { texture: lutTexture },
          rawLutData,
          { bytesPerRow: tSize * 4 * 2 }, // 8 bytes per pixel (RGBA16)
          { width: tSize, height: tSize },
        )
      }

      // 3. Command Encoder Submission Block
      const commandEncoder = device.createCommandEncoder()
      const textureView = context.getCurrentTexture().createView()

      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      }

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
      passEncoder.setPipeline(pipeline)
      passEncoder.setBindGroup(0, bindGroup)
      passEncoder.draw(6) // Render the 6 indexes generating our quad array
      passEncoder.end()

      device.queue.submit([commandEncoder.finish()])
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
      resizeObserver.disconnect()
      uniformBuffer?.destroy()
      lutTexture?.destroy()
      device?.destroy()
    }
  }
}
