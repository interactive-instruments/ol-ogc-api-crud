import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
import { getItem } from "./api";
import { TOOLS, STATES, GEO_TYPES } from "./constants";
import EditorSelect from "./Select";
import {
  sync,
  changesGeo,
  state,
  restoreFeatureOl,
  featureJson,
  featureEtag,
  collection,
  panelOff,
  feature,
  featureOl,
} from "./store";

export const modify = (source) => {
  const modify = new Modify({
    source,
  });

  modify.on("modifyend", (evt) => {
    if (evt.features && evt.features.getLength() > 0) {
      console.log("mod", evt.features.item(0).getGeometry().getRevision());
      changesGeo.set(evt.features.item(0).getGeometry());
    }
  });

  panelOff.subscribe((off) => {
    console.log("MODIFY", !off);
    modify.setActive(!off);
  });

  return modify;
};

export const snap = (source) => {
  return new Snap({
    source,
  });
};

export const select = (
  baseUrl,
  collections,
  source,
  additionalParams,
  token
) => {
  const select = new EditorSelect({
    collections: Object.keys(collections),
    onSelect: (results) => {
      const result = results[0];
      const coll = collections[result.layer];
      const id = result.feature.getId();

      featureOl.set(result.feature);
      restoreFeatureOl.set((f) => source.addFeature(f));
      source.removeFeature(result.feature);

      //TODO: error handling
      getItem(baseUrl, coll.id, id, coll.crs, additionalParams, token).then(
        (json) => {
          collection.set(coll.id);
          feature.set(json.feature.id);
          featureJson.set(json.feature);
          featureEtag.set(json.etag);
          panelOff.set(false);
        }
      );
    },
  });
  select.setActive(false);

  state.subscribe((next) => {
    select.setActive(next.panelOff && next.tool === TOOLS.EDIT);
  });

  return select;
};

export const draws = (source, coll) => {
  const draws = {};
  [GEO_TYPES.POINT, GEO_TYPES.LINE_STRING, GEO_TYPES.POLYGON].forEach(
    (geoType) => {
      const draw = new Draw({
        source,
        type: geoType,
      });
      draw.setActive(false);
      draw.on("drawend", (evt) => {
        console.log(evt.feature.getGeometry().getRevision());
        //TODO
        collection.set(coll.id);
        panelOff.set(false);
        changesGeo.set(evt.feature.getGeometry());
      });

      draws[geoType] = draw;
    }
  );

  state.subscribe((next) => {
    Object.keys(draws).forEach((geo) => {
      draws[geo].setActive(
        next.geo === geo && next.tool === TOOLS.CREATE && next.panelOff
      );
    });
  });

  return Object.values(draws);
};
