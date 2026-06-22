<script lang="ts">
  import PickerCanvas from "./lib/components/PickerCanvas.svelte";
  import Slots from "./lib/components/Slots.svelte";
  import { useSavedState } from "./state.svelte";

  useSavedState();
</script>

<h1>Color picker</h1>
<Slots />

<PickerCanvas />

<style>
  h1 {
    line-height: 1em;
    margin-top: 4rem;
  }
</style>
