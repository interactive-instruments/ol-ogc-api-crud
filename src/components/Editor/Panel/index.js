import Control from "ol/control/Control";
import PanelSvelte from "./Panel.svelte";

export default class EditorPanel extends Control {
  constructor({ map, ...props }) {
    const target = map.getOverlayContainerStopEvent();

    new PanelSvelte({ target, props });

    super({});
  }

  setMap(map) {
    map.render();
  }
}
