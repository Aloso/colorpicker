<script lang="ts">
  import { colorState, type MyColor } from '../../state.svelte'
  import { hsl, hsv, lab, lch, okhsl, okhsv, rgb } from '../colorSpaces'
  import type { ColorSpace } from '../colorSpaces'
  import { converters } from '../helpers/color'
  import { renderSquare } from '../helpers/renderSquare.svelte'
  import { formatCss, lab as convertToLab } from 'culori'
  import { wgpuRenderSquare } from '../helpers/wgpuRenderSquare.svelte'

  const colorSpaces = [okhsl, okhsv, hsl, hsv, rgb, lab, lch]
  const colorSpaceLookup = Object.fromEntries(colorSpaces.map((c) => [c.mode, c])) as {
    [key in MyColor['mode']]: ColorSpace
  }

  let convertedColor = $derived(
    colorState.color.mode === colorState.mode
      ? colorState.color
      : converters[colorState.mode](colorState.color),
  )

  let space = $derived(colorSpaceLookup[colorState.mode] ?? colorSpaceLookup.okhsl)

  let isDarkScheme = $state(false)
  let supportsGpu = $state(false)

  $effect(() => {
    let matchDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkScheme = matchDarkScheme.matches

    matchDarkScheme.addEventListener('change', (event) => {
      isDarkScheme = event.matches
    })
  })

  $effect(() => {
    if (navigator.gpu) {
      ;(async () => {
        const adapter = await navigator.gpu.requestAdapter()
        if (adapter) supportsGpu = true
      })()
    }
  })

  const wheelGetters = $derived({
    value: property(space.mode, space.shaderValue).get,
    padding: () => 0,
    cornerRadius: () => 10,
    background: () => (isDarkScheme ? 0.093 : 1),
    lut: (size: number) => space.lut?.(convertedColor, size) ?? new Uint8Array(),
    wgpuLut: (size: number) => space.wgpuLut?.(convertedColor, size) ?? new Uint16Array(),
  })

  const slidersWithProps = $derived(
    space.components.map((s) => {
      const prop = property(colorState.mode, s.key as any)
      return { ...s, ...prop }
    }),
  )

  function property(mode: MyColor['mode'], key: string) {
    return {
      get() {
        if (colorState.color.mode === mode) {
          return ((colorState.color as any)[key] ?? 0) as number
        } else {
          return ((converters[mode](colorState.color) as any)[key] ?? 0) as number
        }
      },
      set(value: number) {
        if (colorState.color.mode === mode) {
          ;(colorState.color as any)[key] = value
        } else {
          const fallback =
            mode === colorState.color.mode ? colorState.color.fallback : colorState.color

          colorState.color = {
            ...converters[mode](colorState.color),
            [key]: value,
            fallback,
          }
        }
      },
    }
  }

  let coords = $derived(space.coords(convertedColor))
</script>

<div class="vertical-layout">
  <div class="canvas-wrapper">
    <div
      class="handle"
      style="left: {coords[0]}%; top: {coords[1]}%; background-color: {formatCss(
        convertToLab(colorState.color),
      )}"
    ></div>
    {#if supportsGpu && space.wgpuShader && space.wgpuLut}
      <canvas
        {@attach wgpuRenderSquare(
          {
            fragment: space.wgpuShader,
            lut: !!space.wgpuLut,
            lutSize: space.wgpuTextureSize,
          },
          wheelGetters,
        )}
      ></canvas>
    {:else}
      <canvas {@attach renderSquare({ fragment: space.shader, lut: !!space.lut }, wheelGetters)}
      ></canvas>
    {/if}
  </div>

  <div class="sliders">
    <div class="color-spaces">
      {#each colorSpaces as { name, mode }}
        <button
          class="color-space"
          class:active={colorState.mode === mode}
          onclick={() => (colorState.mode = mode)}
        >
          {name}
        </button>
      {/each}

      <!-- <button class="color-space more">More...</button> -->
    </div>

    {#each slidersWithProps as slider (`${colorState.mode}-${slider.key}`)}
      {slider.label}: {Math.round(((convertedColor as any)[slider.key] ?? 0) * 10 * slider.scale) /
        10}{slider.unit}
      <input
        type="range"
        bind:value={slider.get, slider.set}
        min={slider.min}
        max={slider.max}
        step={slider.step}
        onchange={() => {
          colorState.committed = { ...colorState.color }
        }}
      />
    {/each}
  </div>
</div>

<style>
  .vertical-layout {
    display: flex;
    gap: 2rem;
    margin: 2rem 0;

    @media (max-width: 800px) {
      flex-direction: column;
      align-items: center;
    }
  }

  .canvas-wrapper {
    width: 400px;
    max-width: 45%;
    position: relative;

    @media (max-width: 800px) {
      max-width: 100%;
    }

    canvas {
      width: 100%;
      aspect-ratio: 1;
      display: block;
    }

    .handle {
      position: absolute;
      width: 20px;
      height: 20px;
      background-color: white;
      border-radius: 20px;
      box-shadow: 0 0 0 2px #0003;
      transform: translate(-10px, -10px);
    }
  }

  .sliders {
    display: flex;
    flex-direction: column;
    justify-items: stretch;
    gap: 0.5rem;
    flex-grow: 1;
  }

  .color-spaces {
    margin: 0 0 1rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .color-space {
    border: 1px solid var(--border);
    background-color: var(--bg);
    border-radius: 0.25rem;
    margin: 0;
    padding: 0.25rem 0.75rem;
    font: inherit;
    cursor: pointer;
    transition: 0.2s;

    &.active,
    &:hover,
    &:focus {
      border-color: var(--accent-border);
      color: var(--accent);
      background-color: var(--accent-bg);
    }

    &.active {
      font-weight: bold;
      cursor: default;
    }
  }
</style>
