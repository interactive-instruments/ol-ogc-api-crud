import Interaction from "ol/interaction/Interaction";

export default class EditorSelect extends Interaction {
  /**
   * @param {Options} [opt_options] Options.
   */
  constructor(opt_options) {
    super();

    const options = opt_options ? opt_options : {};

    this._onSelect = options.onSelect || null;

    this._collections = options._collections || [];
  }

  handleEvent(evt) {
    let stopEvent = false;
    if (evt.type === "click") {
      const map = evt.map;
      const features = [];

      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => {
          features.push({
            feature,
            layer: layer.get("collection"),
          });
        },
        {
          layerFilter: (layer) =>
            this._collections.length === 0 ||
            this._collections.includes(layer.get("collection")),
        }
      );

      if (features.length > 0) {
        this.setActive(false);
        this._onSelect(features);
      }

      stopEvent = true;
    }
    return !stopEvent;
  }
}
