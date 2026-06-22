import type { MyColor } from "../../state.svelte";
import { converter, type Color } from "culori";

type Converters = {
  [Key in MyColor["mode"]]: (color: MyColor) => Color & { mode: Key };
};

export const converters: Converters = {
  a98: converter("a98"),
  cubehelix: converter("cubehelix"),
  dlab: converter("dlab"),
  dlch: converter("dlch"),
  hsi: converter("hsi"),
  hsl: converter("hsl"),
  hsv: converter("hsv"),
  hwb: converter("hwb"),
  itp: converter("itp"),
  jab: converter("jab"),
  jch: converter("jch"),
  lab: converter("lab"),
  lab65: converter("lab65"),
  lch: converter("lch"),
  lch65: converter("lch65"),
  lchuv: converter("lchuv"),
  lrgb: converter("lrgb"),
  luv: converter("luv"),
  okhsl: converter("okhsl"),
  okhsv: converter("okhsv"),
  oklab: converter("oklab"),
  oklch: converter("oklch"),
  p3: converter("p3"),
  prophoto: converter("prophoto"),
  rec2020: converter("rec2020"),
  rgb: converter("rgb"),
  xyb: converter("xyb"),
  xyz50: converter("xyz50"),
  xyz65: converter("xyz65"),
  yiq: converter("yiq"),
};
