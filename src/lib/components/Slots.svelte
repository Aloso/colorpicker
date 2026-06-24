<script lang="ts">
  import { colorState, slotState, type MyColor, type SavedColor } from '../../state.svelte.js'
  import Slot from './Slot.svelte'

  let favourites = $derived(
    [
      ...slotState.savedExplicitly.slice(-11),
      ...Array.from<SavedColor | undefined>({ length: 12 }),
    ].slice(0, 12),
  )

  function addSavedColor(color: MyColor) {
    const last = slotState.savedExplicitly[slotState.savedExplicitly.length - 1]
    const id = last?.id ?? 0
    slotState.savedExplicitly.push({ color: { ...color }, id: id + 1 })
  }

  function removeSavedColor(id: number) {
    const idx = slotState.savedExplicitly.findIndex((s) => s.id === id)
    if (idx !== -1) slotState.savedExplicitly.splice(idx, 1)
  }

  function select(color: MyColor) {
    colorState.color = colorState.committed = { ...color }
  }
</script>

<p>Favorites:</p>
<div class="row">
  {#each favourites as fav, i}
    <Slot
      type={fav !== undefined
        ? 'color'
        : i === 0 || favourites[i - 1] !== undefined
          ? 'add'
          : 'skeleton'}
      color={fav?.color}
      label="S{i + 1}"
      onAdd={() => addSavedColor(colorState.color)}
      onSelect={fav === undefined ? undefined : () => select(fav.color)}
      onDelete={() => removeSavedColor(fav!.id)}
    />
  {/each}
</div>

<!-- <p>History:</p>
<div class="row">
  {#each history as hers, i}
    <Slot
      type={hers !== undefined ? "color" : "skeleton"}
      color={hers?.color}
      label="S{i + 1}"
      onSelect={hers === undefined ? undefined : () => select(hers.color)}
    />
  {/each}
</div> -->

<p>Selected color:</p>
<div class="row selected">
  <Slot type="color" selected label="Committed color" color={colorState.committed} clampToRgb />
  <Slot type="color" selected label="Selected color" color={colorState.color} />
</div>

<style>
  .row {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.5rem;

    &.selected {
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }
  }
</style>
