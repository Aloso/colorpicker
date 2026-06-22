import type { Color } from "culori";
import {
  getLocallyStoredState,
  saveLocallyStoredState,
} from "./lib/helpers/localStorage";

const version = 1;
const lsKey = "color-state";
const initialState = getLocallyStoredState<SavedState>(lsKey, version);

export type MyColor = Color & { fallback?: Color };

export interface SavedColor {
  id: number;
  color: MyColor;
}

export interface SlotState {
  savedExplicitly: SavedColor[];
  history: SavedColor[];
}

interface SavedState {
  slotState: SlotState;
  color: MyColor;
  mode: MyColor["mode"];
}

export const slotState = $state<SlotState>(
  initialState?.slotState ?? {
    savedExplicitly: [],
    history: [],
  },
);

export interface ColorState {
  color: MyColor;
  committed: MyColor;
  mode: MyColor["mode"];
}

const defaultColor: MyColor = { mode: "rgb", alpha: 1, r: 0.6, g: 0.6, b: 0.6 };

export const colorState = $state<ColorState>({
  color: initialState?.color ?? defaultColor,
  committed: initialState?.color ?? defaultColor,
  mode: initialState?.mode ?? "okhsl",
});

export function useSavedState() {
  $effect(() => {
    const color = colorState.committed;
    const mode = colorState.mode;
    saveLocallyStoredState<SavedState>(lsKey, version, {
      slotState,
      color,
      mode,
    });
  });
}
