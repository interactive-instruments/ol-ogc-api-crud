import { writable, derived, get } from "svelte/store";
import { TOOLS, STATES } from "./constants";
import { buildEditables } from "./schema";

export const tool = writable(TOOLS.NONE);
export const sync = writable(STATES.IDLE);
export const geo = writable();
export const panelOff = writable(true);
export const error = writable();
export const state = derived(
  [tool, sync, geo, panelOff],
  ([$tool, $sync, $geo, $panelOff]) => ({
    tool: $tool,
    sync: $sync,
    geo: $geo,
    panelOff: $panelOff,
  })
);

export const restoreFeatureOl = writable();
export const featureOl = writable();
export const featureJson = writable();
export const featureEtag = writable();
export const collections = writable();
export const collection = writable("");
export const feature = writable("");
export const changesGeo = writable();
export const changesProps = writable();

export const geoTypes = derived(
  [collections, collection],
  ([$collections, $collection]) =>
    $collections && $collections[$collection]
      ? $collections[$collection].geoTypes
      : []
);
export const currentGeoType = derived([geo, geoTypes], ([$geo, $geoTypes]) =>
  $geo && $geoTypes.includes($geo)
    ? $geo
    : $geoTypes.length > 0
    ? $geoTypes[0]
    : false
);

export const hasChanges = derived(
  [tool, featureJson, changesGeo, changesProps],
  ([$tool, $featureJson, $changesGeo, $changesProps]) => {
    const dirty = $tool === TOOLS.CREATE || ($featureJson && $changesGeo);

    if (!dirty && $featureJson && $changesProps) {
      const original = $featureJson.properties;
      const changes = $changesProps;

      return Object.keys(changes).some((key) => {
        return changes[key] !== original[key];
      });
    }

    return dirty;
  }
);

export const changes = derived(
  [collections, collection, featureJson, changesProps, tool, panelOff],
  ([
    $collections,
    $collection,
    $featureJson,
    $changesProps,
    $tool,
    $panelOff,
  ]) => {
    if (
      !$panelOff &&
      $collections &&
      $collections[$collection] &&
      ($featureJson || $tool === TOOLS.CREATE)
    ) {
      return buildEditables(
        $collections[$collection].properties,
        ($featureJson && $featureJson.properties) || {},
        $changesProps
      );
    }
    return [];
  }
);

export const clear = () => {
  if (get(featureOl) && get(restoreFeatureOl)) {
    get(restoreFeatureOl)(get(featureOl));
  }
  //collection.set(undefined);
  //feature.set(undefined);
  featureEtag.set(undefined);
  featureOl.set(undefined);
  featureJson.set(undefined);
  restoreFeatureOl.set(undefined);
  changesGeo.set(undefined);
  changesProps.set(undefined);
  sync.set(STATES.IDLE);
  panelOff.set(true);
};
