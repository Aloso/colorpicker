import type { MyColor } from "../../state.svelte";

export interface ColorSpace {
  name: string;
  mode: MyColor["mode"];

  sliders: Slider[];

  shaderValue: string;
  shader: string;
  lut(color: MyColor, size: number): Uint8Array<ArrayBuffer>;
  coords(color: MyColor): [number, number];
}

export interface Slider {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  scale: number;
}

export function defaultSlider(key: string, label: string): Slider {
  return {
    key,
    label,
    min: 0,
    max: 1,
    step: 0.001,
    unit: "%",
    scale: 100,
  };
}

export function angleSlider(key: string, label: string): Slider {
  return {
    key,
    label,
    min: 0,
    max: 360,
    step: 0.1,
    unit: "°",
    scale: 1,
  };
}

export function rgbSlider(key: string, label: string): Slider {
  return {
    key,
    label,
    min: 0,
    max: 1,
    step: 1 / 2550,
    scale: 255,
  };
}

export function percentSlider(key: string, label: string): Slider {
  return {
    key,
    label,
    min: 0,
    max: 100,
    step: 0.1,
    unit: "%",
    scale: 1,
  };
}

export function v125Slider(key: string, label: string): Slider {
  return {
    key,
    label,
    min: -125,
    max: 125,
    step: 0.1,
    scale: 1,
  };
}

export function t150Slider(key: string, label: string): Slider {
  return {
    key,
    label,
    min: 0,
    max: 150,
    step: 0.1,
    scale: 1,
  };
}

export function hsWheelCoords(col: MyColor): [number, number] {
  const angle = (((col as any).h ?? 0) * Math.PI) / 180;
  return [
    Math.cos(angle) * 50 * (col as any).s + 50,
    Math.sin(angle) * 50 * (col as any).s + 50,
  ];
}

export function noLut(_col: MyColor, _size: number) {
  return new Uint8Array();
}

export * from "./hsl";
export * from "./hsv";
export * from "./lab";
export * from "./lch";
export * from "./okhsl";
export * from "./okhsv";
export * from "./rgb";
