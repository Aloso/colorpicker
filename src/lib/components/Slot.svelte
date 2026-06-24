<script lang="ts">
  import { formatCss, p3 as convertToP3, formatRgb } from 'culori'
  import type { MyColor } from '../../state.svelte'

  interface Props {
    type: 'color' | 'add' | 'skeleton'
    label: string
    color?: MyColor
    selected?: boolean
    clampToRgb?: boolean
    onAdd?: () => void
    onSelect?: () => void
    onDelete?: () => void
  }

  let { type, color, label, selected, clampToRgb, onAdd, onSelect, onDelete }: Props = $props()
  let isAdd = $derived(type === 'add')
  let isSkeleton = $derived(type === 'skeleton')
</script>

<div class="slot">
  {#if type === 'color'}
    <button
      class="color-button"
      class:selected
      style="--color: {clampToRgb ? formatRgb(color!) : formatCss(convertToP3(color!))}"
      aria-label={label}
      onclick={onSelect}
      oncontextmenucapture={(e) => {
        if (onDelete) {
          e.preventDefault()
          onDelete()
        }
      }}
    ></button>
  {:else if type === 'add' || type === 'skeleton'}
    <button
      class="color-button"
      class:isSkeleton
      class:isAdd
      aria-label={label}
      onclick={isAdd ? onAdd : undefined}
    >
      {isAdd ? '+' : undefined}
    </button>
  {/if}
</div>

<style>
  .color-button {
    display: block;
    height: 50px;
    width: 100%;
    background: var(--color);
    border: none;
    margin: 0;
    padding: 0;
    border-radius: 0.25rem;
    border: none;
    line-height: 50px;
    font: inherit;
    font-size: 1.5rem;
    font-weight: bold;
    color: rgb(from var(--text-h) r g b / 0.6);
    box-shadow: inset 0 0 0 1px #0001;
    transition: box-shadow 0.2s;
    cursor: pointer;

    &:hover,
    &:focus {
      box-shadow: inset 0 0 0 4px #0002;
    }

    &.selected {
      cursor: default;
      box-shadow: none;

      .slot:first-child & {
        border-radius: 0.25rem 0 0 0.25rem;
      }
      .slot:last-child & {
        border-radius: 0 0.25rem 0.25rem 0;
      }
    }

    &.isAdd {
      box-shadow:
        inset 0 0 0 1px #0002,
        inset 0 0 0 100px transparent;

      &:hover,
      &:focus {
        box-shadow:
          inset 0 0 0 1px #0002,
          inset 0 0 0 100px #0001;
      }
    }

    &.isSkeleton {
      opacity: 0.6;
      cursor: default;
      box-shadow: inset 0 0 0 1px #0002;
    }
  }
</style>
