import { mount } from "svelte";

import Control from "ol/control/Control";
import Tools from "./Tools.svelte";

export default class EditorTools extends Control {
  constructor({ position = {}, ...props }) {
    const target = document.createElement("div");
    target.className =
      "ogc-api-crud-tools ol-unselectable ol-control flex flex-col";
    Object.keys(position).forEach((key) => {
      target.style[key] = position[key];
    });

    mount(Tools, { target, props });

    super({
      element: target,
    });
  }
}
